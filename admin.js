import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDjYQsoFTfL1mx8qr_ae7lwUCnnDZxAOGg",
  authDomain: "aeroprep-5e42e.firebaseapp.com",
  projectId: "aeroprep-5e42e",
  storageBucket: "aeroprep-5e42e.firebasestorage.app",
  messagingSenderId: "302156524619",
  appId: "1:302156524619:web:027ee2100640cdcea871ce"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = 'elhichoahmed8@gmail.com';

const $ = id => document.getElementById(id);

function showMessage(text, isError = false) {
  const m = $('adminMessage');
  m.textContent = text;
  m.className = isError ? 'message error' : 'message success';
  m.hidden = false;
}

$('adminLoginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('adminEmail').value.trim();
  const password = $('adminPassword').value;
  
  if (email !== ADMIN_EMAIL) {
    showMessage('Accès refusé. Compte non administrateur.', true);
    return;
  }
  
  const btn = $('adminLoginBtn');
  btn.disabled = true;
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
    showMessage('Identifiants incorrects.', true);
    btn.disabled = false;
  }
});

$('logoutBtn').addEventListener('click', () => {
  signOut(auth);
});

async function loadLogs() {
  const tbody = $('logsBody');
  try {
    const q = query(collection(db, "login_logs"), orderBy("timestamp", "desc"), limit(100));
    const snapshot = await getDocs(q);
    
    $('logCount').textContent = snapshot.size + (snapshot.size === 100 ? '+' : '');
    
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Aucune connexion enregistrée.</td></tr>';
      return;
    }
    
    tbody.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const date = data.timestamp ? data.timestamp.toDate().toLocaleString('fr-FR') : 'Date inconnue';
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${date}</strong></td>
        <td>${data.email}</td>
        <td><span class="device-info">${data.userAgent || 'Inconnu'}</span></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state" style="color:#ff7b83">Erreur lors du chargement des données. Vous n\'avez peut-être pas les droits administrateur ou les règles Firestore ne sont pas configurées.</td></tr>';
  }
}

onAuthStateChanged(auth, user => {
  if (user && user.email === ADMIN_EMAIL) {
    $('loginView').hidden = true;
    $('dashboardView').hidden = false;
    loadLogs();
  } else {
    $('loginView').hidden = false;
    $('dashboardView').hidden = true;
    if (user) {
      // Un utilisateur normal essaie d'accéder à l'admin
      signOut(auth);
      showMessage('Accès refusé. Réservé à l\'administrateur.', true);
    }
  }
});
