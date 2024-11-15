import { db } from './firebase-config.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { 
    collection, 
    getDocs, 
    deleteDoc, 
    doc, 
    writeBatch 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

async function setUserAsOwner(userId) {
    try {
        await setDoc(doc(db, 'users', userId), {
            role: 'owner'
        }, { merge: true });
        console.log('Ruolo owner assegnato con successo');
    } catch (error) {
        console.error('Errore nell\'assegnazione del ruolo:', error);
    }
}

// Aggiungi questa funzione per eliminare più prenotazioni
async function deleteSelectedBookings() {
    const selectedCheckboxes = document.querySelectorAll('.booking-checkbox:checked');
    const batch = writeBatch(db);
    
    try {
        selectedCheckboxes.forEach((checkbox) => {
            const bookingId = checkbox.getAttribute('data-id');
            const bookingRef = doc(db, 'bookings', bookingId);
            batch.delete(bookingRef);
        });
        
        await batch.commit();
        alert('Prenotazioni selezionate eliminate con successo');
        location.reload();
    } catch (error) {
        console.error('Errore durante l\'eliminazione:', error);
        alert('Errore durante l\'eliminazione delle prenotazioni');
    }
}

// Aggiungi questa funzione per eliminare tutte le prenotazioni
async function deleteAllBookings() {
    if (!confirm('Sei sicuro di voler eliminare tutte le prenotazioni?')) {
        return;
    }
    
    try {
        const bookingsRef = collection(db, 'bookings');
        const snapshot = await getDocs(bookingsRef);
        const batch = writeBatch(db);
        
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        alert('Tutte le prenotazioni sono state eliminate');
        location.reload();
    } catch (error) {
        console.error('Errore durante l\'eliminazione:', error);
        alert('Errore durante l\'eliminazione delle prenotazioni');
    }
}

// Esempio di utilizzo:
// setUserAsOwner('ID-UTENTE-DA-PROMUOVERE'); 