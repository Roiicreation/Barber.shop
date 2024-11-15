import { db } from '../config/firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    Timestamp 
} from 'firebase/firestore';

// Modello per le prenotazioni
export const appointmentsRef = collection(db, 'appointments');
export const servicesRef = collection(db, 'services');
export const stylistsRef = collection(db, 'stylists');

// Funzioni per gestire le prenotazioni
export const bookingService = {
    // Crea una nuova prenotazione
    createAppointment: async (appointmentData) => {
        try {
            const docRef = await addDoc(appointmentsRef, {
                ...appointmentData,
                createdAt: Timestamp.now(),
                status: 'pending'
            });
            return docRef.id;
        } catch (error) {
            throw new Error('Errore nella creazione della prenotazione: ' + error.message);
        }
    },

    // Ottieni tutte le prenotazioni di un utente
    getUserAppointments: async (userId) => {
        try {
            const q = query(appointmentsRef, where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            throw new Error('Errore nel recupero delle prenotazioni: ' + error.message);
        }
    },

    // Aggiorna una prenotazione
    updateAppointment: async (appointmentId, updateData) => {
        try {
            const appointmentRef = doc(db, 'appointments', appointmentId);
            await updateDoc(appointmentRef, updateData);
            return true;
        } catch (error) {
            throw new Error('Errore nell\'aggiornamento della prenotazione: ' + error.message);
        }
    },

    // Cancella una prenotazione
    cancelAppointment: async (appointmentId) => {
        try {
            await deleteDoc(doc(db, 'appointments', appointmentId));
            return true;
        } catch (error) {
            throw new Error('Errore nella cancellazione della prenotazione: ' + error.message);
        }
    },

    // Ottieni tutti gli appuntamenti (solo per proprietari)
    getAllAppointments: async () => {
        try {
            const querySnapshot = await getDocs(appointmentsRef);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            throw new Error('Errore nel recupero degli appuntamenti: ' + error.message);
        }
    },

    // Ottieni statistiche appuntamenti
    getAppointmentStats: async () => {
        try {
            const querySnapshot = await getDocs(appointmentsRef);
            const appointments = querySnapshot.docs.map(doc => doc.data());
            
            return {
                total: appointments.length,
                byMonth: appointments.reduce((acc, apt) => {
                    const month = new Date(apt.date).getMonth();
                    acc[month] = (acc[month] || 0) + 1;
                    return acc;
                }, {}),
                byService: appointments.reduce((acc, apt) => {
                    acc[apt.service] = (acc[apt.service] || 0) + 1;
                    return acc;
                }, {})
            };
        } catch (error) {
            throw new Error('Errore nel calcolo delle statistiche: ' + error.message);
        }
    }
};

// Funzioni per gestire i servizi
export const serviceService = {
    // Ottieni tutti i servizi
    getAllServices: async () => {
        try {
            const querySnapshot = await getDocs(servicesRef);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            throw new Error('Errore nel recupero dei servizi: ' + error.message);
        }
    },

    // Aggiungi un nuovo servizio
    addService: async (serviceData) => {
        try {
            const docRef = await addDoc(servicesRef, serviceData);
            return docRef.id;
        } catch (error) {
            throw new Error('Errore nell\'aggiunta del servizio: ' + error.message);
        }
    }
};

// Funzioni per gestire gli stilisti
export const stylistService = {
    // Ottieni tutti gli stilisti
    getAllStylists: async () => {
        try {
            const querySnapshot = await getDocs(stylistsRef);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            throw new Error('Errore nel recupero degli stilisti: ' + error.message);
        }
    },

    // Ottieni disponibilità stilista
    getStylistAvailability: async (stylistId, date) => {
        try {
            const q = query(
                appointmentsRef, 
                where("stylistId", "==", stylistId),
                where("date", "==", date)
            );
            const querySnapshot = await getDocs(q);
            const bookedSlots = querySnapshot.docs.map(doc => doc.data().time);
            return bookedSlots;
        } catch (error) {
            throw new Error('Errore nel recupero della disponibilità: ' + error.message);
        }
    }
};
