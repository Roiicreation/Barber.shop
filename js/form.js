document.addEventListener('DOMContentLoaded', function() {
    // Validazione telefono
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Rimuove tutti i caratteri non numerici
            let value = e.target.value.replace(/\D/g, '');
            
            // Formatta il numero (xxx xxx xxxx)
            if (value.length > 0) {
                value = value.match(new RegExp('.{1,3}', 'g')).join(' ');
            }
            
            e.target.value = value;
        });
    }

    // Gestione label flottanti
    const formInputs = document.querySelectorAll('.form-group input');
    formInputs.forEach(input => {
        // Aggiunge placeholder vuoto per gestire lo stato :placeholder-shown
        input.setAttribute('placeholder', ' ');
        
        // Gestisce lo stato iniziale se il campo ha un valore
        if (input.value) {
            input.classList.add('has-value');
        }

        input.addEventListener('input', function() {
            if (this.value) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
    });

    // Gestione della navigazione tra gli step
    let currentStep = 1;
    const totalSteps = 3;

    function showStep(step) {
        // Nascondi tutti gli step
        document.querySelectorAll('.form-step').forEach(el => {
            el.classList.remove('active');
        });
        
        // Mostra lo step corrente
        document.getElementById(`step${step}`).classList.add('active');
        
        // Aggiorna la progress bar se presente
        updateProgress(step);
    }

    function nextStep() {
        // Validazione per lo step 2
        if (currentStep === 2) {
            const selectedDate = document.querySelector('.fc-day.selected-date');
            const selectedTime = document.querySelector('.time-slot.selected');
            
            if (!selectedDate || !selectedTime) {
                const errorMessage = !selectedDate ? 
                    'Per favore, seleziona una data prima di procedere.' :
                    'Per favore, seleziona un orario prima di procedere.';
                
                // Mostra messaggio di errore
                const errorDiv = document.getElementById('booking-error');
                if (errorDiv) {
                    errorDiv.textContent = errorMessage;
                    errorDiv.style.display = 'block';
                } else {
                    alert(errorMessage);
                }
                return;
            }
            
            // Nascondi eventuale messaggio di errore precedente
            const errorDiv = document.getElementById('booking-error');
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }
        
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
        }
    }

    function prevStep() {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    }

    // Funzione per aggiornare la progress bar (se presente)
    function updateProgress(step) {
        const progress = ((step - 1) / (totalSteps - 1)) * 100;
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    // Inizializza il form mostrando il primo step
    showStep(currentStep);

    // Gestione pulsanti di navigazione
    const nextButtons = document.querySelectorAll('.next-step');
    nextButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            nextStep();
        });
    });

    const prevButtons = document.querySelectorAll('.prev-step');
    prevButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            prevStep();
        });
    });

    const registrationForm = document.getElementById('registration-form');
    
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;

            try {
                await userService.registerUser(email, password, {
                    name,
                    phone,
                    email
                });
                
                alert('Registrazione completata con successo!');
                window.location.href = '/login.html';
            } catch (error) {
                alert('Errore nella registrazione: ' + error.message);
            }
        });
    }
});
