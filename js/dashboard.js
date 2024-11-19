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

// Inizializzazione al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
    checkOwnerAccess();
}); 