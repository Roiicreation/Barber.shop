import { db } from '../config/firebase';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs,
    updateDoc,
    doc,
    orderBy,
    Timestamp 
} from 'firebase/firestore';

export const notificationService = {
    // Crea una nuova notifica
    createNotification: async (userId, data) => {
        try {
            const notificationRef = collection(db, 'notifications');
            await addDoc(notificationRef, {
                userId,
                ...data,
                createdAt: Timestamp.now(),
                read: false
            });
        } catch (error) {
            throw new Error('Errore nella creazione della notifica: ' + error.message);
        }
    },

    // Ottieni tutte le notifiche di un utente
    getUserNotifications: async (userId) => {
        try {
            const q = query(
                collection(db, 'notifications'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            throw new Error('Errore nel recupero delle notifiche: ' + error.message);
        }
    },

    // Segna una notifica come letta
    markAsRead: async (notificationId) => {
        try {
            const notificationRef = doc(db, 'notifications', notificationId);
            await updateDoc(notificationRef, {
                read: true
            });
        } catch (error) {
            throw new Error('Errore nell\'aggiornamento della notifica: ' + error.message);
        }
    }
};

// Funzione per creare notifiche di appuntamento
export const createAppointmentNotifications = async (appointmentData) => {
    const { userId, date, time, serviceType } = appointmentData;
    
    // Notifica di conferma prenotazione
    await notificationService.createNotification(userId, {
        type: 'appointment_confirmation',
        title: 'Prenotazione Confermata',
        message: `Il tuo appuntamento per ${serviceType} è stato confermato per il ${date} alle ${time}`,
        appointmentId: appointmentData.id
    });

    // Crea un reminder per 24 ore prima
    const appointmentDate = new Date(date);
    const reminderDate = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);

    if (reminderDate > new Date()) {
        await notificationService.createNotification(userId, {
            type: 'appointment_reminder',
            title: 'Reminder Appuntamento',
            message: `Ricorda: hai un appuntamento domani alle ${time}`,
            appointmentId: appointmentData.id,
            scheduledFor: Timestamp.fromDate(reminderDate)
        });
    }
};
