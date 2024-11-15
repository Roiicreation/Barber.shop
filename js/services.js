import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    getDocs,
    addDoc 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Importa anche la configurazione di Firebase se non è già importata
import { db } from './firebase-config.js';

let currentStep = 1;
const totalSteps = 3;

// Definisci showStep come funzione globale
function showStep(stepNumber) {
    // Nascondi tutti gli step
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
        step.style.display = 'none';
    });
    
    // Mostra lo step corrente
    const currentStep = document.getElementById(`step${stepNumber}`);
    if (currentStep) {
        currentStep.classList.add('active');
        currentStep.style.display = 'block';
        
        // Se è lo step 3, aggiorna il riepilogo
        if (stepNumber === 3) {
            updateSummary();
        }
    }
}

// Funzione per aggiornare il riepilogo
function updateSummary() {
    const serviceSummary = document.getElementById('service-summary');
    const dateSummary = document.getElementById('date-summary');
    const timeSummary = document.getElementById('time-summary');
    
    if (serviceSummary) {
        serviceSummary.textContent = localStorage.getItem('selectedService') || '-';
    }
    if (dateSummary) {
        dateSummary.textContent = localStorage.getItem('selectedDate') || '-';
    }
    if (timeSummary) {
        timeSummary.textContent = localStorage.getItem('selectedTime') || '-';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Elementi DOM
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const services = document.querySelectorAll('.service-card');
    const nextButton = document.querySelector('.form-navigation .next-step');

    // Imposta lo stato iniziale
    if (step2) {
        step2.style.display = 'none';
    }

    // Gestione selezione servizi
    if (services) {
        services.forEach(service => {
            service.addEventListener('click', () => {
                // Rimuovi selezione precedente
                services.forEach(s => s.classList.remove('selected'));
                
                // Seleziona questo servizio
                service.classList.add('selected');
                
                // Abilita pulsante
                if (nextButton) {
                    nextButton.disabled = false;
                    nextButton.style.opacity = '1';
                }
            });
        });
    }

    // Gestione click pulsante Avanti
    if (nextButton) {
        
        nextButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const step1 = document.getElementById('step1');
            const step2 = document.getElementById('step2');
         
           
            if (step1 && step2) {
                // Rimuovi tutte le classi e stili esistenti
                step1.className = 'form-step';
                step2.className = 'form-step';
                
                // Rimuovi gli stili inline
                step1.removeAttribute('style');
                step2.removeAttribute('style');
                
                // Applica i nuovi stili e classi
                setTimeout(() => {
                    step1.style.display = 'none';
                    step2.style.display = 'block';
                    step2.classList.add('active');
                }, 0);
                
                // Aggiorna anche i dot di progresso se presenti
                const dots = document.querySelectorAll('.step-dot');
                dots.forEach((dot, index) => {
                    if (index === 1) dot.classList.add('active');
                });
            }
        });
    } else {
    }

    // Gestione pulsante indietro (opzionale)
    const prevButton = document.querySelector('.prev-step');
    if (prevButton) {
        prevButton.addEventListener('click', function(e) {
            e.preventDefault();
            step2.style.display = 'none';
            step1.style.display = 'block';
        });
    }

    // Gestione selezione servizio
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            // Rimuovi selezione precedente
            serviceCards.forEach(c => c.classList.remove('selected'));
            
            // Aggiungi selezione al servizio cliccato
            this.classList.add('selected');
            
            // Ottieni il nome del servizio dalla classe service-name
            const serviceName = this.querySelector('.service-name');
            if (serviceName) {
                const serviceText = serviceName.textContent.trim();
                // Salva nel localStorage
                localStorage.setItem('selectedService', serviceText);
            }
        });
    });

    // Gestione pulsante "Indietro"
    document.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const currentStep = this.closest('.form-step');
            const currentStepNumber = parseInt(currentStep.id.replace('step', ''));
            showStep(currentStepNumber - 1);
        });
    });

    // Gestione pulsante "Avanti"
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const currentStep = this.closest('.form-step');
            const currentStepNumber = parseInt(currentStep.id.replace('step', ''));
            showStep(currentStepNumber + 1);
        });
    });

    // Gestione form submit
    const bookingForm = document.getElementById('details-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const bookingData = {
                service: localStorage.getItem('selectedService'),
                date: localStorage.getItem('selectedDate'),
                time: localStorage.getItem('selectedTime'),
                name: document.getElementById('booking-name').value,
                phone: document.getElementById('booking-phone').value
            };
            
            try {
                const bookingId = await saveBooking(bookingData);
                showConfirmationPopup(
                    bookingData.date,
                    bookingData.time,
                    bookingData.service
                );
                
                localStorage.removeItem('selectedService');
                localStorage.removeItem('selectedDate');
                localStorage.removeItem('selectedTime');
                
                window.location.href = '#home';
                
            } catch (error) {
            }
        });
    }

    // Mostra il primo step all'avvio
    showStep(1);

    // Aggiungi event listener per il campo telefono
    const phoneInput = document.getElementById('booking-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            validatePhoneInput(this);
        });

        // Previeni l'incolla di testo non numerico
        phoneInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const numericText = pastedText.replace(/\D/g, '');
            this.value = numericText.slice(0, 10);
        });

        // Previeni la digitazione di caratteri non numerici
        phoneInput.addEventListener('keypress', function(e) {
            if (!/^\d$/.test(e.key)) {
                e.preventDefault();
            }
        });
    }

    // Gestione selezione data
    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach(day => {
        day.addEventListener('click', async function() {
            if (!this.classList.contains('disabled')) {
                // Rimuovi la selezione precedente
                document.querySelectorAll('.calendar-day').forEach(d => 
                    d.classList.remove('selected'));
                
                // Seleziona il nuovo giorno
                this.classList.add('selected');
                
                // Salva la data selezionata
                const selectedDate = this.getAttribute('data-date');
                localStorage.setItem('selectedDate', selectedDate);
                
                // Aggiorna gli slot temporali disponibili
                await updateTimeSlots(selectedDate);
            }
        });
    });

    // Gestione selezione orario
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            if (!this.classList.contains('disabled')) {
                // Rimuovi la selezione precedente
                document.querySelectorAll('.time-slot').forEach(s => 
                    s.classList.remove('selected'));
                
                // Seleziona il nuovo orario
                this.classList.add('selected');
                
                // Salva l'orario selezionato
                localStorage.setItem('selectedTime', this.textContent.trim());
            }
        });
    });
});

// Inizializza il primo step
showStep(1);

// Funzione per salvare la prenotazione
async function saveBooking(bookingData) {
    try {
        const db = getFirestore();
        const bookingsRef = collection(db, 'bookings');
        
        // Crea l'oggetto dati senza il campo notes
        const bookingToSave = {
            service: bookingData.service,
            date: bookingData.date,
            time: bookingData.time,
            name: bookingData.name,
            phone: bookingData.phone,
            createdAt: new Date(),
            status: 'pending'
        };
        
        const docRef = await addDoc(bookingsRef, bookingToSave);
        return docRef.id;
    } catch (error) {
        console.error('Errore nel salvare la prenotazione:', error);
        throw error;
    }
}
// Aggiungi questa funzione per la validazione del telefono
function validatePhoneInput(input) {
    // Rimuove tutti i caratteri non numerici
    input.value = input.value.replace(/\D/g, '');
    
    // Limita la lunghezza a 10 cifre
    if (input.value.length > 10) {
        input.value = input.value.slice(0, 10);
    }
}

// Funzione per ottenere le prenotazioni esistenti per una data specifica
async function getBookedSlots(selectedDate) {
    try {
        const db = getFirestore();
        const bookingsRef = collection(db, 'bookings');
        
        // Query per ottenere tutte le prenotazioni per la data selezionata
        const q = query(
            bookingsRef,
            where("date", "==", selectedDate)
        );
        
        const querySnapshot = await getDocs(q);
        const bookedTimes = [];
        
        querySnapshot.forEach((doc) => {
            const booking = doc.data();
            bookedTimes.push(booking.time);
        });
        
        return bookedTimes;
    } catch (error) {
        console.error('Errore nel recupero delle prenotazioni:', error);
        return [];
    }
}

// Funzione per aggiornare gli slot temporali disponibili
async function updateTimeSlots(selectedDate) {
    try {
        // Ottieni gli slot già prenotati
        const bookedSlots = await getBookedSlots(selectedDate);
        
        // Seleziona tutti gli slot temporali
        const timeSlots = document.querySelectorAll('.time-slot');
        
        timeSlots.forEach(slot => {
            const slotTime = slot.textContent.trim();
            
            if (bookedSlots.includes(slotTime)) {
                // Disabilita lo slot se è già prenotato
                slot.classList.add('disabled');
                slot.classList.remove('selected');
                slot.setAttribute('disabled', 'disabled');
                slot.style.cursor = 'not-allowed';
                slot.style.backgroundColor = '#f0f0f0';
                slot.style.color = '#999';
            } else {
                // Abilita lo slot se è disponibile
                slot.classList.remove('disabled');
                slot.removeAttribute('disabled');
                slot.style.cursor = 'pointer';
                slot.style.backgroundColor = '';
                slot.style.color = '';
            }
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento degli slot temporali:', error);
    }
}

