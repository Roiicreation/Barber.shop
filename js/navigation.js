document.addEventListener('DOMContentLoaded', function() {
    // Rimuovi completamente il pulsante Avanti dallo step 2 all'inizio
    const navigationDiv = document.querySelector('#step2 .form-navigation');
    if (navigationDiv) {
        // Mantieni solo il pulsante Indietro
        navigationDiv.innerHTML = '<button class="prev-step">Indietro</button>';
    }

    // Aggiungi il pulsante Avanti solo quando data e ora sono selezionati
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('calendar-day') || e.target.classList.contains('time-slot')) {
            const selectedDate = document.querySelector('.calendar-day.selected');
            const selectedTime = document.querySelector('.time-slot.selected');

            // Se entrambi sono selezionati, aggiungi il pulsante Avanti
            if (selectedDate && selectedTime && navigationDiv) {
                if (!navigationDiv.querySelector('.next-step')) {
                    const nextButton = document.createElement('button');
                    nextButton.className = 'next-step';
                    nextButton.textContent = 'Avanti';
                    
                    // Aggiungi l'event listener al nuovo pulsante
                    nextButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        document.getElementById('step2').style.display = 'none';
                        document.getElementById('step3').style.display = 'block';
                    });

                    navigationDiv.appendChild(nextButton);
                }
            }
        }
    });

    // Gestione pulsante Indietro
    document.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const currentStep = parseInt(this.closest('.form-step').id.replace('step', ''));
            
            document.getElementById(`step${currentStep}`).style.display = 'none';
            document.getElementById(`step${currentStep - 1}`).style.display = 'block';
        });
    });
});
