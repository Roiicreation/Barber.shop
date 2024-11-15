import { getFirestore, collection, query, where, getDocs, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

class BookingSystem {
    constructor() {
        this.db = getFirestore();
        this.appointmentsRef = collection(this.db, 'appointments');
    }

    // Salva una nuova prenotazione
    async saveBooking(bookingData) {
        try {
            const docRef = await addDoc(this.appointmentsRef, {
                ...bookingData,
                createdAt: new Date().toISOString()
            });
            ('Prenotazione salvata:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Errore nel salvare la prenotazione:', error);
            throw error;
        }
    }

    // Recupera tutte le prenotazioni per una data
    async getBookingsForDate(date) {
        try {
            const q = query(this.appointmentsRef, where("date", "==", date));
            const querySnapshot = await getDocs(q);
            
            const bookings = [];
            querySnapshot.forEach((doc) => {
                bookings.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return bookings;
        } catch (error) {
            console.error('Errore nel recupero prenotazioni:', error);
            throw error;
        }
    }

    // Recupera tutte le prenotazioni (per debug)
    async getAllBookings() {
        try {
            const snapshot = await getDocs(this.appointmentsRef);
            const bookings = [];
            
            snapshot.forEach((doc) => {
                bookings.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return bookings;
        } catch (error) {
            console.error('Errore nel recupero di tutte le prenotazioni:', error);
            throw error;
        }
    }
}

export const bookingSystem = new BookingSystem();
