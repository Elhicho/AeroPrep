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

let connectionsChartInstance = null;
let browsersChartInstance = null;

function renderCharts(datesData, browsersData) {
  $('chartsContainer').hidden = false;
  
  // Inverser pour avoir l'ordre chronologique (les plus anciens d'abord sur le graphique)
  const labels = Object.keys(datesData).reverse();
  const dataPoints = Object.values(datesData).reverse();

  const ctxConn = document.getElementById('connectionsChart').getContext('2d');
  if(connectionsChartInstance) connectionsChartInstance.destroy();
  connectionsChartInstance = new Chart(ctxConn, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Connexions par jour',
        data: dataPoints,
        borderColor: '#a6bfdb',
        backgroundColor: 'rgba(166,191,219,0.2)',
        tension: 0.3,
        fill: true
      }]
    },
    options: { responsive: true, plugins: { legend: { labels: { color: '#a6bfdb' } } }, scales: { x: { ticks: { color: '#a6bfdb' } }, y: { ticks: { color: '#a6bfdb', stepSize: 1 } } } }
  });

  const ctxBrows = document.getElementById('browsersChart').getContext('2d');
  if(browsersChartInstance) browsersChartInstance.destroy();
  browsersChartInstance = new Chart(ctxBrows, {
    type: 'doughnut',
    data: {
      labels: Object.keys(browsersData),
      datasets: [{
        data: Object.values(browsersData),
        backgroundColor: ['#ff9f43', '#ff7b83', '#a6bfdb', '#4a6583', '#142842'],
        borderWidth: 0
      }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#a6bfdb' } } } }
  });
}

function getBrowserName(ua) {
  if (!ua) return 'Inconnu';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  return 'Autre';
}

async function loadLogs() {
  const tbody = $('logsBody');
  try {
    const q = query(collection(db, "login_logs"), orderBy("timestamp", "desc"), limit(100));
    const snapshot = await getDocs(q);
    
    $('logCount').textContent = snapshot.size + (snapshot.size === 100 ? '+' : '');
    
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Aucune connexion enregistrée.</td></tr>';
      return;
    }
    
    tbody.innerHTML = '';
    const datesData = {};
    const browsersData = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const dateObj = data.timestamp ? data.timestamp.toDate() : new Date();
      const dateStr = dateObj.toLocaleDateString('fr-FR');
      const timeStr = dateObj.toLocaleString('fr-FR');
      
      // Agrégation
      datesData[dateStr] = (datesData[dateStr] || 0) + 1;
      const browser = getBrowserName(data.userAgent);
      browsersData[browser] = (browsersData[browser] || 0) + 1;
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${timeStr}</strong></td>
        <td>${data.email}</td>
        <td><span class="device-info">${data.userAgent || 'Inconnu'}</span></td>
        <td>${data.location || 'Inconnue'}<br><span class="device-info">${data.ip || ''}</span></td>
      `;
      tbody.appendChild(tr);
    });
    
    renderCharts(datesData, browsersData);
    
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state" style="color:#ff7b83">Erreur lors du chargement des données. Vous n\'avez peut-être pas les droits administrateur ou les règles Firestore ne sont pas configurées.</td></tr>';
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
