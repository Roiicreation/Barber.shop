import { db, auth } from './firebase-config.js';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Verifica accesso owner
async function checkOwnerAccess() {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = '/login.html';
        return;
    }

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'owner') {
        window.location.href = '/unauthorized.html';
        return;
    }
}

// Carica appuntamenti
async function loadAppointments() {
    const appointmentsRef = collection(db, 'appointments');
    const querySnapshot = await getDocs(appointmentsRef);
    
    const appointmentsList = document.querySelector('.appointments-list');
    appointmentsList.innerHTML = '';

    querySnapshot.forEach((doc) => {
        const appointment = doc.data();
        appointmentsList.innerHTML += `
            <div class="appointment-card">
                <h3>${appointment.name}</h3>
                <p>Data: ${appointment.date}</p>
                <p>Ora: ${appointment.time}</p>
                <p>Servizio: ${appointment.service}</p>
                <div class="appointment-actions">
                    <button onclick="updateStatus('${doc.id}', 'completed')">Completa</button>
                    <button onclick="deleteAppointment('${doc.id}')">Cancella</button>
                </div>
            </div>
        `;
    });
}

// Carica statistiche
async function loadStatistics() {
    const today = new Date().toISOString().split('T')[0];
    const appointmentsRef = collection(db, 'appointments');
    
    // Appuntamenti oggi
    const todayQuery = query(appointmentsRef, where("date", "==", today));
    const todaySnapshot = await getDocs(todayQuery);
    document.getElementById('today-appointments').textContent = todaySnapshot.size;
    
    // Appuntamenti questo mese
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthQuery = query(appointmentsRef, 
        where("date", ">=", monthStart.toISOString().split('T')[0]));
    const monthSnapshot = await getDocs(monthQuery);
    document.getElementById('monthly-appointments').textContent = monthSnapshot.size;
}

// Inizializza dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await checkOwnerAccess();
    await loadAppointments();
    await loadStatistics();
}); 