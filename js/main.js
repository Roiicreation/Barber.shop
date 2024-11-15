import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    doc, 
    getDoc,
    query,
    where,
    getDocs
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(date).toLocaleDateString('it-IT', options);
}

document.addEventListener('DOMContentLoaded', function() {
    // Rimuovi il loader
    const loader = document.querySelector('.loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 1000);
    }

    // Gestione passaggi prenotazione
    let currentStep = 1;
    const totalSteps = 3;
    
    // Gestione selezione servizio
    const serviceOptions = document.querySelectorAll('.service-option');
    serviceOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Rimuovi la selezione precedente
            serviceOptions.forEach(opt => {
                opt.classList.remove('selected');
                opt.querySelector('input[type="radio"]').checked = false;
            });
            
            // Aggiungi la nuova selezione
            this.classList.add('selected');
            this.querySelector('input[type="radio"]').checked = true;
        });
    });

    // Funzione per aggiornare lo stato dei passaggi
    function updateSteps() {
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            if (stepNumber < currentStep) {
                step.classList.add('active', 'completed');
            } else if (stepNumber === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        document.querySelectorAll('.form-step').forEach((step, index) => {
            if (index + 1 === currentStep) {
                step.style.display = 'block';
                if (currentStep === 2) {
                    initModernCalendar(); // Inizializza il calendario quando si passa allo step 2
                }
            } else {
                step.style.display = 'none';
            }
        });
    }

    // Gestione pulsanti Avanti/Indietro
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const currentStepElement = this.closest('.form-step');
            if (currentStepElement) {
                const stepNumber = parseInt(currentStepElement.id.replace('step', ''));
                if (stepNumber === 1) {
                    document.getElementById('step1').style.display = 'none';
                    document.getElementById('step2').style.display = 'block';
                }
            }
        });
    });

    document.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateSteps();
            }
        });
    });

    // Aggiungi questa funzione per il nuovo calendario
    function initModernCalendar() {
        const calendar = document.getElementById('modern-calendar');
        if (!calendar) return;

        // Data corrente e limite
        const today = new Date();
        const maxDate = new Date();
        maxDate.setMonth(today.getMonth() + 1);
        maxDate.setDate(today.getDate() - 1);

        // Mese e anno correnti per la visualizzazione
        let currentMonth = today.getMonth();
        let currentYear = today.getFullYear();

        const monthYearElement = calendar.querySelector('.month-year');
        const daysGrid = calendar.querySelector('.days-grid');
        const prevMonthBtn = calendar.querySelector('.prev-month');
        const nextMonthBtn = calendar.querySelector('.next-month');

        function updateMonthNavigation() {
            const prevMonthBtn = calendar.querySelector('.prev-month');
            const nextMonthBtn = calendar.querySelector('.next-month');

            // Mostra/nascondi il pulsante "precedente"
            const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
            prevMonthBtn.classList.toggle('visible', !isCurrentMonth);

            // Mostra/nascondi il pulsante "successivo"
            const isMaxMonth = currentMonth === maxDate.getMonth() && currentYear === maxDate.getFullYear();
            nextMonthBtn.classList.toggle('visible', !isMaxMonth);
        }

        function renderCalendar() {
            // Aggiorna intestazione mese/anno
            const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                              'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
            monthYearElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;

            // Calcola i giorni del mese
            const firstDay = new Date(currentYear, currentMonth, 1);
            const lastDay = new Date(currentYear, currentMonth + 1, 0);
            const totalDays = lastDay.getDate();
            
            let startDay = firstDay.getDay();
            startDay = startDay === 0 ? 6 : startDay - 1;

            daysGrid.innerHTML = '';

            // Aggiungi spazi vuoti iniziali
            for (let i = 0; i < startDay; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day empty';
                daysGrid.appendChild(emptyDay);
            }

            // Aggiungi i giorni
            for (let day = 1; day <= totalDays; day++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                dayElement.textContent = day;

                const currentDate = new Date(currentYear, currentMonth, day);
                
                if (currentDate.toDateString() === today.toDateString()) {
                    dayElement.classList.add('today');
                }

                if (currentDate < today || currentDate > maxDate) {
                    dayElement.classList.add('disabled');
                } else {
                    dayElement.addEventListener('click', function() {
                        document.querySelectorAll('.calendar-day').forEach(d => {
                            d.classList.remove('selected');
                        });
                        this.classList.add('selected');
                        showAvailableTimeSlots(currentDate);
                    });
                }

                daysGrid.appendChild(dayElement);
            }

            updateMonthNavigation();
        }

        // Eventi per i pulsanti di navigazione
        prevMonthBtn.addEventListener('click', () => {
            if (currentMonth === today.getMonth() && currentYear === today.getFullYear()) return;
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            if (currentMonth === maxDate.getMonth() && currentYear === maxDate.getFullYear()) return;
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });

        // Inizializza il calendario
        renderCalendar();
    }

    // Inizializza lo stato dei passaggi
    updateSteps();

    // Funzione per gestire la selezione della data
    function handleDateSelection(dateElement) {
        // Rimuovi la selezione precedente
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Aggiungi la classe selected
        dateElement.classList.add('selected');
        
        // Ottieni la data selezionata
        const day = dateElement.textContent;
        const month = document.querySelector('.calendar-title').textContent;
        const date = new Date(`${month} ${day}, ${new Date().getFullYear()}`);
        
        // Formatta la data in italiano
        const formattedDate = date.toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Salva nel localStorage
        localStorage.setItem('selectedDate', formattedDate);
        console.log('Data salvata:', formattedDate); // Debug
    }

    // Funzione per gestire la selezione/deselezione degli orari
    function handleTimeSlotSelection(event) {
        const timeSlot = event.target;
        
        // Se lo slot è già selezionato, deselezionalo
        if (timeSlot.classList.contains('selected')) {
            timeSlot.classList.remove('selected');
            localStorage.removeItem('selectedTime');
            updateBookingSummary(); // Aggiorna il riepilogo
            return;
        }
        
        // Altrimenti, rimuovi la selezione da tutti gli slot
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // E seleziona questo slot
        timeSlot.classList.add('selected');
        localStorage.setItem('selectedTime', timeSlot.textContent);
        updateBookingSummary(); // Aggiorna il riepilogo
    }

    // Funzione per generare gli slot temporali
    function generateTimeSlots() {
        const morningSlots = document.querySelector('.time-period .morning-slots');
        const afternoonSlots = document.querySelector('.time-period .afternoon-slots');
        
        console.log('Morning slots:', morningSlots); // Debug
        console.log('Afternoon slots:', afternoonSlots); // Debug
        
        if (!morningSlots || !afternoonSlots) {
            console.log('Contenitori degli slot non trovati'); // Debug
            return;
        }
        
        // Pulisci i contenitori
        morningSlots.innerHTML = '';
        afternoonSlots.innerHTML = '';
        
        // Definisci gli orari
        const morningTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
        const afternoonTimes = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'];
        
        // Crea gli slot
        morningTimes.forEach(time => {
            const slot = createTimeSlot(time);
            morningSlots.appendChild(slot);
        });
        
        afternoonTimes.forEach(time => {
            const slot = createTimeSlot(time);
            afternoonSlots.appendChild(slot);
        });
    }

    // Funzione per creare un singolo slot temporale
    function createTimeSlot(time) {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.textContent = time;
        
        slot.addEventListener('click', function() {
            if (this.classList.contains('selected')) {
                // Deseleziona
                this.classList.remove('selected');
                localStorage.removeItem('selectedTime');
            } else {
                // Deseleziona tutti gli altri slot
                document.querySelectorAll('.time-slot').forEach(s => {
                    s.classList.remove('selected');
                });
                // Seleziona questo slot
                this.classList.add('selected');
                localStorage.setItem('selectedTime', time);
            }
            // Aggiorna il riepilogo se necessario
            if (typeof updateBookingSummary === 'function') {
                updateBookingSummary();
            }
        });
        
        return slot;
    }

    // Assicurati che la funzione venga chiamata quando il documento è pronto
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM caricato, genero gli slot temporali'); // Debug
        generateTimeSlots();
    });

    // Aggiungi anche un listener per quando viene selezionata una data
    document.addEventListener('dateSelected', function() {
        console.log('Data selezionata, rigenero gli slot temporali'); // Debug
        generateTimeSlots();
    });

    // Genera gli orari all'avvio della pagina
    document.addEventListener('DOMContentLoaded', function() {
        generateTimeSlots();
    });

    // Rigenera gli orari quando viene selezionata una nuova data
    const daysGrid = document.querySelector('.days-grid');
    if (daysGrid) {
        daysGrid.addEventListener('click', function(e) {
            if (e.target.classList.contains('calendar-day') && !e.target.classList.contains('disabled')) {
                generateTimeSlots();
            }
        });
    }

    // Funzione per validare lo step 2
    function validateStep2() {
        const selectedDate = document.querySelector('.calendar-day.selected');
        const selectedTime = document.querySelector('.time-slot.selected');
        return selectedDate && selectedTime;
    }

    // Event listeners
    document.addEventListener('DOMContentLoaded', function() {
        // Listener per la selezione della data
        document.querySelector('.days-grid').addEventListener('click', function(e) {
            if (e.target.classList.contains('calendar-day') && !e.target.classList.contains('disabled')) {
                handleDateSelection(e.target);
            }
        });

        // Listener per il pulsante "Avanti"
        document.querySelector('#step2 .next-step').addEventListener('click', function(e) {
            e.preventDefault();
            if (validateStep2()) {
                showStep(3);
            }
        });

        // Listener per il pulsante "Indietro"
        document.querySelector('#step2 .prev-step').addEventListener('click', function(e) {
            e.preventDefault();
            showStep(1);
        });

        // Genera gli orari iniziali
        generateTimeSlots();
    });

    // Inizializzazione
    document.addEventListener('DOMContentLoaded', function() {
        generateTimeSlots();
    });

    // Aggiungi queste funzioni al tuo JavaScript esistente

    // Funzione per ottenere i dettagli della prenotazione
    async function getBookingDetails(bookingId) {
        try {
            const bookingRef = doc(db, 'bookings', bookingId);
            const bookingSnap = await getDoc(bookingRef);
            
            if (bookingSnap.exists()) {
                return bookingSnap.data();
            } else {
                throw new Error('Prenotazione non trovata');
            }
        } catch (error) {
            console.error('Errore nel recupero dei dettagli:', error);
            throw error;
        }
    }

    // Funzione per salvare la prenotazione su Firebase
    async function saveBooking(bookingData) {
        try {
            if (!db) {
                throw new Error('Firebase non è inizializzato correttamente');
            }

            // Usa collection() e addDoc() invece di db.collection()
            const bookingsCollection = collection(db, 'bookings');
            const docRef = await addDoc(bookingsCollection, bookingData);
            
            console.log("Prenotazione salvata con ID: ", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("Errore dettagliato: ", error);
            throw error;
        }
    }

    // Validazione e formattazione del numero di telefono
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        // Crea il div per il messaggio di errore
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        phoneInput.parentNode.appendChild(errorDiv);

        phoneInput.addEventListener('input', function(e) {
            // Rimuove tutti i caratteri non numerici
            let value = e.target.value.replace(/\D/g, '');
            
            // Limita a 10 cifre
            value = value.substring(0, 10);
            
            // Aggiorna il valore del campo
            e.target.value = value;
            
            // Aggiorna la validità del campo e mostra/nascondi il messaggio di errore
            this.classList.remove('valid', 'invalid');
            if (value.length > 0) {
                this.classList.add(value.length === 10 ? 'valid' : 'invalid');
                errorDiv.textContent = value.length === 10 ? '' : 'Il numero deve contenere 10 cifre';
                errorDiv.style.display = value.length === 10 ? 'none' : 'block';
            } else {
                errorDiv.textContent = '';
                errorDiv.style.display = 'none';
            }
        });
    }

    // Aggiungi stili CSS
    if (!document.getElementById('form-validation-styles')) {
        const formStyles = document.createElement('style');
        formStyles.id = 'form-validation-styles';
        formStyles.textContent = `
            .form-group {
                position: relative;
                margin-bottom: 1.5rem;
            }

            .error-message {
                color: #dc3545;
                font-size: 0.85rem;
                margin-top: 0.3rem;
                display: none;
                position: absolute;
                bottom: -20px;
                left: 0;
            }

            .form-group input.invalid {
                border-color: #dc3545;
            }

            .form-group input.valid {
                border-color: #28a745;
            }
        `;
        document.head.appendChild(formStyles);
    }

    // Funzione per validare il form
    function validateForm() {
        const phone = document.getElementById('phone').value;
        return phone.length === 10 && /^\d{10}$/.test(phone);
    }

    // Gestione del submit
    const confirmButton = document.querySelector('#step3 .next-step');
    if (confirmButton) {
        confirmButton.addEventListener('click', async function(e) {
            e.preventDefault();
            
            if (!validateForm()) {
                return;
            }
            
            try {
                this.disabled = true;
                this.textContent = 'Elaborazione...';

                const bookingData = getBookingDetails();
                const bookingsCollection = collection(db, 'bookings');
                await addDoc(bookingsCollection, bookingData);
                
                // Mostra il popup invece dell'alert
                showConfirmationPopup(bookingData);

            } catch (error) {
                console.error('Errore:', error);
                alert(error.message);
            } finally {
                this.disabled = false;
                this.textContent = 'Conferma';
            }
        });
    }

    // Funzione per aggiornare gli slot temporali
    function updateTimeSlots(date) {
        const morningSlots = document.querySelector('.morning-slots');
        const afternoonSlots = document.querySelector('.afternoon-slots');
        
        if (!morningSlots || !afternoonSlots) return;
        
        // Pulisci gli slot esistenti
        morningSlots.innerHTML = '';
        afternoonSlots.innerHTML = '';
        
        // Genera gli slot temporali
        const slots = generateTimeSlots('09:00', '19:00', 30);
        
        slots.forEach(time => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.setAttribute('data-time', time);
            slot.textContent = time;
            
            slot.addEventListener('click', function() {
                document.querySelectorAll('.time-slot').forEach(s => {
                    s.classList.remove('selected');
                });
                this.classList.add('selected');
            });
            
            // Dividi tra mattina e pomeriggio
            const hour = parseInt(time.split(':')[0]);
            if (hour < 13) {
                morningSlots.appendChild(slot);
            } else {
                afternoonSlots.appendChild(slot);
            }
        });
    }

    // Funzione per generare gli slot temporali
    function generateTimeSlots(start, end, intervalMinutes) {
        const slots = [];
        let current = new Date(`2000-01-01 ${start}`);
        const endTime = new Date(`2000-01-01 ${end}`);
        
        while (current < endTime) {
            slots.push(current.toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit'
            }));
            current.setMinutes(current.getMinutes() + intervalMinutes);
        }
        
        return slots;
    }

    // Se hai bisogno di verificare la disponibilità degli orari
    async function checkAvailability(date, stylistId) {
        try {
            const bookingsCollection = collection(db, 'bookings');
            const q = query(
                bookingsCollection,
                where("date", "==", date),
                where("stylistId", "==", stylistId)
            );
            
            const querySnapshot = await getDocs(q);
            const bookedSlots = [];
            
            querySnapshot.forEach((doc) => {
                bookedSlots.push(doc.data().time);
            });
            
            return bookedSlots;
        } catch (error) {
            console.error('Errore nel controllo disponibilità:', error);
            throw error;
        }
    }

    // Aggiungi lo stile del popup al tuo CSS
    const style = document.createElement('style');
    style.textContent = `
        .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .popup {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            text-align: center;
            max-width: 90%;
            width: 400px;
            position: relative;
            animation: popupIn 0.3s ease-out;
        }

        @keyframes popupIn {
            from {
                transform: scale(0.8);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }

        .popup h3 {
            color: #4CAF50;
            margin-bottom: 1rem;
        }

        .popup p {
            margin-bottom: 1.5rem;
        }

        .popup button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 0.8rem 2rem;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.3s ease;
        }

        .popup button:hover {
            background: #45a049;
        }
    `;
    document.head.appendChild(style);

    // Funzione per mostrare il popup di conferma
    function showConfirmationPopup(date, time, service) {
        // Aggiorna i dettagli della prenotazione
        document.getElementById('confirm-date').textContent = date;
        document.getElementById('confirm-time').textContent = time;
        document.getElementById('confirm-service').textContent = service;
        
        // Mostra il popup
        const popup = document.querySelector('.confirmation-popup');
        popup.classList.add('show');
        
        // Inizia il countdown
        let countdown = 5;
        const countdownElement = document.getElementById('countdown');
        
        const timer = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(timer);
                
                // Pulisci localStorage
                localStorage.clear();
                
                // Resetta gli step
                currentStep = 1;  // Resetta la variabile currentStep
                
                // Nascondi tutti gli step e mostra solo il primo
                document.querySelectorAll('.form-step').forEach(step => {
                    step.style.display = 'none';
                });
                document.getElementById('step1').style.display = 'block';
                
                // Resetta gli indicatori degli step
                document.querySelectorAll('.step').forEach((step, index) => {
                    step.classList.remove('active', 'completed');
                    if (index === 0) {
                        step.classList.add('active');
                    }
                });
                
                // Resetta le selezioni dei servizi
                document.querySelectorAll('.service-option').forEach(option => {
                    option.classList.remove('selected');
                    const radio = option.querySelector('input[type="radio"]');
                    if (radio) radio.checked = false;
                });
                
                // Nascondi il popup
                popup.classList.remove('show');
                
                // Reindirizza alla home
                window.location.href = '#home';
                
                // Ricarica la pagina
                window.location.reload();
            }
        }, 1000);
    }
  
    // Aggiorna l'HTML per includere il campo note
    function updateFormHTML() {
        const formStep3 = document.querySelector('#step3 .details-form');
        if (!formStep3) return;

        // Aggiungi il campo note dopo il campo telefono
        const notesField = `
            <div class="form-group">
                <textarea 
                    id="notes" 
                    placeholder=" "
                    rows="3"
                ></textarea>
                <label for="notes">Note (opzionale)</label>
            </div>
        `;

    }

    // Chiama la funzione per aggiornare il form quando il documento è caricato
    document.addEventListener('DOMContentLoaded', updateFormHTML);

    

    // Aggiungi stili CSS per il form
    const formStyles = `
        .form-group {
            margin-bottom: 1.5rem;
            position: relative;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .form-group textarea {
            min-height: 100px;
            resize: vertical;
            font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            border-color: var(--primary);
            outline: none;
            box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
        }

        .form-group input.valid {
            border-color: #28a745;
        }

        .form-group input.invalid {
            border-color: #dc3545;
        }

        .form-group label {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            background: white;
            padding: 0 5px;
            color: #666;
            transition: all 0.3s ease;
            pointer-events: none;
        }

        .form-group textarea + label {
            top: 20px;
        }

        .form-group input:focus + label,
        .form-group textarea:focus + label,
        .form-group input:not(:placeholder-shown) + label,
        .form-group textarea:not(:placeholder-shown) + label {
            top: 0;
            font-size: 0.85rem;
            color: var(--primary);
        }
    `;

    // Inserisci gli stili nel documento
    const styleSheet = document.createElement('style');
    styleSheet.textContent = formStyles;
    document.head.appendChild(styleSheet);

    // Aggiorna l'HTML del form
    function updateFormHTML() {
        const formStep3 = document.querySelector('#step3 .details-form');
        if (!formStep3) return;

        // Aggiorna il campo note
        const notesField = `
            <div class="form-group">
                <textarea 
                    id="booking-notes" 
                    placeholder=" "
                    rows="4"
                ></textarea>
                <label for="booking-notes">Note (opzionale)</label>
            </div>
        `;

        // Inserisci il campo note
        formStep3.insertAdjacentHTML('beforeend', notesField);
    }

    // Inizializzazione
    document.addEventListener('DOMContentLoaded', function() {
        updateFormHTML();
        setupPhoneValidation();
    });

    // Funzione per ottenere i dati della prenotazione
    function getBookingDetails() {
        const name = document.getElementById('name')?.value?.trim();
        const phone = document.getElementById('phone')?.value?.trim();
        const selectedService = document.querySelector('input[name="service"]:checked')?.value;
        const selectedDate = document.querySelector('.calendar-day.selected')?.getAttribute('data-date');
        const selectedTime = document.querySelector('.time-slot.selected')?.getAttribute('data-time');

        // Validazione solo dei campi dello step 3
        if (!name) throw new Error('Inserisci il tuo nome');
        if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
            throw new Error('Inserisci un numero di telefono valido (10 cifre)');
        }
        if (!selectedService) throw new Error('Seleziona un servizio');

        return {
            name,
            phone,
            service: selectedService,
            dataPrenotazione: new Date().toLocaleDateString('it-IT'),
            dataAppuntamento: selectedDate,
            orario: selectedTime,
            status: 'confermata'
        };
    }

    // Modifica la gestione della navigazione tra gli step
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', function(e) {
            const currentStepElement = this.closest('.form-step');
            const currentStep = parseInt(currentStepElement.id.replace('step', ''));
            
            // Validazione specifica per lo step 2
            if (currentStep === 2) {
                if (!validateStep2()) {
                    e.preventDefault();
                    return;
                }
            }

            // Procedi con la navigazione normale
            if (currentStep < totalSteps) {
                showStep(currentStep + 1);
            }
        });
    });

    // Funzione per mostrare lo step specifico
    function showStep(stepNumber) {
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
            step.style.display = 'none';
        });
        
        const currentStep = document.getElementById(`step${stepNumber}`);
        if (currentStep) {
            currentStep.classList.add('active');
            currentStep.style.display = 'block';
            
            if (stepNumber === 3) {
                updateBookingSummary();
            }
        }
    }

    // Funzione per aggiornare la barra di progresso
    function updateProgressBar(currentStep) {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const progress = ((currentStep - 1) / 2) * 100;
            progressBar.style.width = progress + '%';
        }
    }

    // Reindirizza alla home page al caricamento
    document.addEventListener('DOMContentLoaded', function() {
        // Se non siamo già nella home page
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            window.location.href = '/';
        }
    });

    // Funzione per controllare se un servizio è stato selezionato
    function isServiceSelected() {
        const selectedService = document.querySelector('.service-option.selected');
        return selectedService !== null;
    }

    // Funzione per mostrare il popup di avviso
    function showAlert(message) {
        const newAlertDiv = document.createElement('div');
        newAlertDiv.className = 'alert-popup';
        newAlertDiv.innerHTML = `
            <div class="alert-content">
                <h4>Attenzione</h4>
                <p>${message}</p>
                <button class="alert-button">OK</button>
            </div>
        `;
        
        const okButton = newAlertDiv.querySelector('.alert-button');
        okButton.addEventListener('click', () => newAlertDiv.remove());
        
        document.body.appendChild(newAlertDiv);
    }

    // Event listener principale
    document.addEventListener('DOMContentLoaded', () => {
        // Gestione click sui time slots
        const timeSlots = document.querySelectorAll('.time-slot');
        timeSlots.forEach(slot => {
            slot.addEventListener('click', function() {
                timeSlots.forEach(s => s.classList.remove('selected'));
                this.classList.add('selected');
            });
        });

        // Gestione form submit
        const bookingForm = document.querySelector('.booking-form');
        if (bookingForm) {
            bookingForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveAppointmentData();
            });
        }
    });

    // Funzione per aggiornare il riepilogo della prenotazione
    function updateBookingSummary() {
        const selectedDate = localStorage.getItem('selectedDate');
        const selectedTime = localStorage.getItem('selectedTime');
        const selectedService = localStorage.getItem('selectedService');

        console.log('Dati recuperati:', { selectedDate, selectedTime, selectedService }); // Debug

        const dateSummary = document.getElementById('date-summary');
        const timeSummary = document.getElementById('time-summary');
        const serviceSummary = document.getElementById('service-summary');

        if (dateSummary) {
            dateSummary.textContent = selectedDate || 'Seleziona una data';
        }
        if (timeSummary) {
            timeSummary.textContent = selectedTime || 'Seleziona un orario';
        }
        if (serviceSummary) {
            serviceSummary.textContent = selectedService || 'Seleziona un servizio';
        }
    }

    // Aggiungi anche un listener per il calendario
    document.addEventListener('DOMContentLoaded', function() {
        const calendarDays = document.querySelectorAll('.calendar-day');
        calendarDays.forEach(day => {
            day.addEventListener('click', function() {
                if (!this.classList.contains('disabled') && !this.classList.contains('empty')) {
                    handleDateSelection(this);
                }
            });
        });
    });

    // Trova la sezione dove gestisci il click sul pulsante di conferma prenotazione
    document.addEventListener('DOMContentLoaded', function() {
        const confirmButton = document.querySelector('.confirm-booking');
        
        if (confirmButton) {
            confirmButton.addEventListener('click', async function(e) {
                e.preventDefault();
                
                // Mostra il popup
                const popup = document.createElement('div');
                popup.className = 'popup';
                popup.innerHTML = `
                    <div class="popup-content">
                        <i class="fas fa-check-circle"></i>
                        <h3>Prenotazione Confermata!</h3>
                        <p>Il tuo appuntamento è stato prenotato con successo.</p>
                        <button class="close-popup">OK</button>
                    </div>
                `;
                
                document.body.appendChild(popup);
                popup.style.display = 'flex';
                
                // Gestisci il click sul pulsante OK
                popup.querySelector('.close-popup').addEventListener('click', function() {
                    popup.remove();
                    window.location.href = '/';
                });
                
                // Reindirizza automaticamente dopo 3 secondi
                setTimeout(() => {
                    popup.remove();
                    window.location.href = '/';
                }, 3000);
            });
        }
    });

    // Aggiungi questo JavaScript
    document.addEventListener('DOMContentLoaded', function() {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        const links = document.querySelectorAll('.nav-links a');

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Chiudi il menu quando si clicca su un link
        links.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    });

    // Aggiungi questo codice al tuo file main.js
    document.addEventListener('DOMContentLoaded', function() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        function onScroll() {
            const scrollPos = window.pageYOffset || document.documentElement.scrollTop;

            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100; // offset di 100px
                const sectionHeight = section.clientHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + sectionId) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        window.addEventListener('scroll', onScroll);
    });

    // Seleziona tutti i link della navbar
    const navLinks = document.querySelectorAll('.nav-link, .nav-btn');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            // Animazione fluida dello scroll
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Aggiungi effetto di highlight temporaneo alla sezione
            targetSection.style.animation = 'highlightSection 1s ease';
            
            // Rimuovi l'animazione dopo che è completata
            setTimeout(() => {
                targetSection.style.animation = '';
            }, 1000);
        });
    });

    // Assicurati che questo codice venga eseguito quando il documento è pronto
    document.addEventListener('DOMContentLoaded', function() {
        // Definisci gli orari
        const morningTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
        const afternoonTimes = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'];

        // Trova i contenitori degli orari
        const timeSlotsContainer = document.querySelector('.time-slots-side');
        
        // Se il contenitore non esiste, crealo
        if (!timeSlotsContainer) {
            console.error('Contenitore time-slots-side non trovato');
            return;
        }

        // Svuota il contenitore esistente
        timeSlotsContainer.innerHTML = `
            <div class="time-period">
                <h4>MATTINA</h4>
                <div class="morning-slots"></div>
            </div>
            <div class="time-period">
                <h4>POMERIGGIO</h4>
                <div class="afternoon-slots"></div>
            </div>
        `;

        // Trova i contenitori specifici
        const morningContainer = timeSlotsContainer.querySelector('.morning-slots');
        const afternoonContainer = timeSlotsContainer.querySelector('.afternoon-slots');

        // Funzione per creare un singolo slot
        function createTimeSlot(time) {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = time;
            
            slot.addEventListener('click', function() {
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                } else {
                    // Deseleziona tutti gli altri slot
                    document.querySelectorAll('.time-slot').forEach(s => {
                        s.classList.remove('selected');
                    });
                    this.classList.add('selected');
                }
            });
            
            return slot;
        }

        // Genera gli slot del mattino
        morningTimes.forEach(time => {
            const slot = createTimeSlot(time);
            morningContainer.appendChild(slot);
        });

        // Genera gli slot del pomeriggio
        afternoonTimes.forEach(time => {
            const slot = createTimeSlot(time);
            afternoonContainer.appendChild(slot);
        });

        console.log('Orari generati'); // Debug
    });

    // Gestione click sugli slot temporali
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
            } else {
                // Deseleziona tutti gli altri slot
                document.querySelectorAll('.time-slot').forEach(s => {
                    s.classList.remove('selected');
                });
                // Seleziona questo slot
                this.classList.add('selected');
            }
        });
    });

    // Aggiungi questo al tuo JavaScript
    document.addEventListener('DOMContentLoaded', function() {
        // Per il pulsante "Prenota Ora"
        document.querySelector('.nav-btn').addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('#booking').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });

        // Per il pulsante "Scopri di Più"
        document.querySelector('.hero-btn').addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('#about').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // Funzione per mostrare il popup di conferma
    function showConfirmationPopup(date, time, service) {
        // Aggiorna i dettagli della prenotazione
        document.getElementById('confirm-date').textContent = date;
        document.getElementById('confirm-time').textContent = time;
        document.getElementById('confirm-service').textContent = service;
        
        // Mostra il popup
        const popup = document.querySelector('.confirmation-popup');
        popup.classList.add('show');
        
        // Inizia il countdown
        let countdown = 5;
        const countdownElement = document.getElementById('countdown');
        
        const timer = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(timer);
                
                // Pulisci localStorage
                localStorage.clear();
                
                // Resetta gli step
                currentStep = 1;  // Resetta la variabile currentStep
                
                // Nascondi tutti gli step e mostra solo il primo
                document.querySelectorAll('.form-step').forEach(step => {
                    step.style.display = 'none';
                });
                document.getElementById('step1').style.display = 'block';
                
                // Resetta gli indicatori degli step
                document.querySelectorAll('.step').forEach((step, index) => {
                    step.classList.remove('active', 'completed');
                    if (index === 0) {
                        step.classList.add('active');
                    }
                });
                
                // Resetta le selezioni dei servizi
                document.querySelectorAll('.service-option').forEach(option => {
                    option.classList.remove('selected');
                    const radio = option.querySelector('input[type="radio"]');
                    if (radio) radio.checked = false;
                });
                
                // Nascondi il popup
                popup.classList.remove('show');
                
                // Reindirizza alla home
                window.location.href = '#home';
                
                // Ricarica la pagina
                window.location.reload();
            }
        }, 1000);
    }

    // Aggiungi questo al tuo event listener esistente per il pulsante di conferma
    document.addEventListener('DOMContentLoaded', function() {
        const confirmButton = document.querySelector('.confirm-booking');
        if (confirmButton) {  // Verifica che l'elemento esista
            confirmButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                const selectedDate = localStorage.getItem('selectedDate');
                const selectedTime = localStorage.getItem('selectedTime');
                const selectedService = localStorage.getItem('selectedService');
                
                // Mostra il popup di conferma
                showConfirmationPopup(selectedDate, selectedTime, selectedService);
                
                return false;
            });
        }
    });

    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Nella funzione di gestione della prenotazione
    async function handleBooking(e) {
        e.preventDefault();
        
        try {
            // Codice per salvare la prenotazione
            const bookingData = {
                date: localStorage.getItem('selectedDate'),
                time: localStorage.getItem('selectedTime'),
                service: localStorage.getItem('selectedService')
            };
            
            // Salva nel database
            await addDoc(collection(db, "bookings"), bookingData);
            
            // Mostra SOLO il popup personalizzato, senza alert
            showConfirmationPopup(
                bookingData.date, 
                bookingData.time, 
                bookingData.service
            );
            
        } catch (error) {
            console.error("Errore durante la prenotazione:", error);
        }
    }

    // Modifica la gestione del form di prenotazione
    document.getElementById('details-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            const bookingData = {
                date: localStorage.getItem('selectedDate'),
                time: localStorage.getItem('selectedTime'),
                service: localStorage.getItem('selectedService'),
                name: document.getElementById('booking-name').value,
                phone: document.getElementById('booking-phone').value
            };
            
            // Salvataggio silenzioso nel database
            await addDoc(collection(db, "bookings"), bookingData);
            
            // Solo popup personalizzato
            showConfirmationPopup(
                bookingData.date, 
                bookingData.time, 
                bookingData.service
            );
            
        } catch (error) {
            console.error("Errore durante la prenotazione:", error);
        }
        
        return false;
    });
});