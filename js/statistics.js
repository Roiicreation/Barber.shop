async function loadAppointments() {
    try {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const todayString = today.toLocaleDateString('it-IT', options);
        
        const bookingsSnapshot = await db.collection('bookings')
            .where('date', '==', todayString)
            .get();

        const appointmentsCountElement = document.querySelector('.stats-number');
        if (appointmentsCountElement) {
            appointmentsCountElement.textContent = bookingsSnapshot.size;
        }

    } catch (error) {
        console.error('Errore nel caricamento degli appuntamenti:', error);
    }
}

function setupRealtimeUpdates() {
    // Ottieni la data di oggi nel formato corretto
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const todayString = today.toLocaleDateString('it-IT', options);

    // Salva il timestamp di quando il listener viene inizializzato
    const initTimestamp = Date.now();

    // Riferimento alla collezione bookings
    const bookingsRef = db.collection('bookings');
    
    // Imposta il listener
    bookingsRef
        .where('date', '==', todayString)
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    const booking = change.doc.data();
                    
                    // Verifica se il documento è stato creato dopo l'inizializzazione del listener
                    if (booking.createdAt && booking.createdAt.toMillis() > initTimestamp) {
                        // Ricarica la pagina solo per le nuove prenotazioni
                        window.location.reload();
                    }
                }
            });
        });
}

// Inizializza il listener quando la pagina è caricata
window.addEventListener('load', setupRealtimeUpdates);

// Funzione per aggiornare la pagina ogni 30 minuti
function setupPageRefresh() {
    // Aggiorna la pagina ogni 30 minuti
    setInterval(() => {
        window.location.reload();
    }, 1800000); // 1800000 millisecondi = 30 minuti
}

// Avvia l'aggiornamento automatico quando la pagina è caricata
window.addEventListener('load', setupPageRefresh); 