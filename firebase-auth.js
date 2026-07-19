import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDjYQsoFTfL1mx8qr_ae7lwUCnnDZxAOGg",
  authDomain: "aeroprep-5e42e.firebaseapp.com",
  projectId: "aeroprep-5e42e",
  storageBucket: "aeroprep-5e42e.firebasestorage.app",
  messagingSenderId: "302156524619",
  appId: "1:302156524619:web:027ee2100640cdcea871ce"
};

// Initialisation
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const PARTS = ['payload-part-1.txt','payload-part-2.txt','payload-part-3.txt','payload-part-4.txt','payload-part-5.txt','payload-part-6.txt','payload-part-7.txt','payload-part-8.txt','payload-part-9.txt'];
const ADMIN_EMAIL = 'elhichoahmed8@gmail.com';

const $ = id => document.getElementById(id);
const msg = (t, c = '') => {
  const m = $('authMessage');
  m.textContent = t;
  m.className = c ? `message ${c}` : 'message';
  m.hidden = false;
};
const clearMsg = () => { $('authMessage').hidden = true; };
const busy = (b, on, t) => {
  if (!b) return;
  b.disabled = on;
  const s = b.querySelector('span');
  if (s) s.textContent = on ? 'Vérification…' : t;
};
const bad = (el, on) => on ? el.setAttribute('aria-invalid', 'true') : el.removeAttribute('aria-invalid');

// Ouvrir l'application
let appOpened = false;
async function openApp() {
  if (appOpened) return;
  appOpened = true;
  $('authView').hidden = true;
  $('loadingView').hidden = false;
  try {
    if (typeof DecompressionStream != 'function') throw Error('no gzip');
    const rs = await Promise.all(PARTS.map(p => fetch(p, { cache: 'no-store' })));
    if (rs.some(r => !r.ok)) throw Error('missing part');
    const enc = (await Promise.all(rs.map(r => r.text()))).join('');
    const bin = atob(enc);
    const cmp = Uint8Array.from(bin, c => c.charCodeAt(0));
    const stream = new Blob([cmp]).stream().pipeThrough(new DecompressionStream('gzip'));
    const html = await new Response(stream).text();
    document.open();
    document.write(html);
    document.close();
  } catch (e) {
    console.error(e);
    $('loadingView').hidden = true;
    $('authView').hidden = false;
    msg('Impossible de charger l’application. Recharge la page ou utilise un navigateur récent.', 'error');
  }
}

// Enregistrer la connexion
async function logConnection(user) {
  try {
    await addDoc(collection(db, "login_logs"), {
      email: user.email,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent
    });
  } catch (e) {
    console.error("Erreur log", e);
  }
}

// Soumission du formulaire de connexion
$('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  clearMsg();
  
  const email = $('loginEmail').value.trim();
  const password = $('loginPassword').value;
  const remember = $('rememberMe').checked;
  
  bad($('loginEmail'), !email);
  bad($('loginPassword'), !password);
  
  if (!email || !password) {
    msg('Renseigne ton adresse e-mail et ton mot de passe.', 'error');
    return;
  }
  
  busy($('loginButton'), true, 'Entrer dans AeroPrep');
  
  try {
    // Gérer la persistance
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    
    // Connexion
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    msg('Identification réussie.', 'success');
    
    // Loguer la connexion en arrière-plan
    logConnection(userCredential.user);
    
    // Ouvrir l'app
    await openApp();
  } catch (err) {
    console.error(err);
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      msg('Identifiants incorrects. L\'accès est restreint.', 'error');
    } else if (err.code === 'auth/too-many-requests') {
      msg('Trop de tentatives. Réessaie plus tard.', 'error');
    } else {
      msg('Erreur de connexion. Vérifie ta connexion internet.', 'error');
    }
  } finally {
    busy($('loginButton'), false, 'Entrer dans AeroPrep');
  }
});

// Mot de passe oublié
$('resetPasswordButton').addEventListener('click', async () => {
  const email = $('loginEmail').value.trim();
  if (!email) {
    msg('Saisis ton adresse e-mail puis clique sur "Mot de passe oublié".', 'error');
    bad($('loginEmail'), true);
    return;
  }
  
  try {
    await sendPasswordResetEmail(auth, email);
    msg('Si ce compte existe, un e-mail de réinitialisation a été envoyé.', 'success');
  } catch (err) {
    console.error(err);
    msg('Erreur lors de l\'envoi de l\'e-mail.', 'error');
  }
});

// Afficher/Masquer le mot de passe
document.addEventListener('click', e => {
  const b = e.target.closest('[data-toggle]');
  if (!b) return;
  const i = $(b.dataset.toggle);
  const show = i.type === 'password';
  i.type = show ? 'text' : 'password';
  b.textContent = show ? 'Masquer' : 'Afficher';
  b.setAttribute('aria-label', `${show ? 'Masquer' : 'Afficher'} le mot de passe`);
});

// Vérifier si déjà connecté
onAuthStateChanged(auth, user => {
  if (user) {
    if (user.email === ADMIN_EMAIL) {
      const adminLink = $('adminLink');
      if(adminLink) adminLink.hidden = false;
    }
    openApp();
  }
});
