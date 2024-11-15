// Funzione per aggiornare il riepilogo
function updateSummary() {
    const serviceSummary = document.getElementById('service-summary');
    const dateSummary = document.getElementById('date-summary');
    const timeSummary = document.getElementById('time-summary');

    // Recupera i dati salvati
    const selectedService = localStorage.getItem('selectedService');
    const selectedDate = localStorage.getItem('selectedDate');
    const selectedTime = localStorage.getItem('selectedTime');

    if (serviceSummary) serviceSummary.textContent = selectedService || '-';
    if (dateSummary) dateSummary.textContent = selectedDate || '-';
    if (timeSummary) timeSummary.textContent = selectedTime || '-';
}

// Event Listeners per lo step 3
document.addEventListener('DOMContentLoaded', () => {
    const step3 = document.getElementById('step3');
    if (step3) {
        // Gestione pulsante indietro
        const backButton = step3.querySelector('.btn-back');
        if (backButton) {
            backButton.addEventListener('click', () => {
                // Nascondi step 3
                document.getElementById('step3').style.display = 'none';
                
                // Mostra step 2
                const step2 = document.getElementById('step2');
                step2.style.display = 'block';
                
                // Aggiorna gli indicatori dei passi
                const steps = document.querySelectorAll('.step');
                steps[2].classList.remove('active'); // Disattiva step 3
                steps[1].classList.add('active');    // Attiva step 2
            });
        }

        // Gestione form submit
        const confirmButton = step3.querySelector('.btn-confirm');
        if (confirmButton) {
            confirmButton.addEventListener('click', async function(e) {
                e.preventDefault();
                
                try {
                    // Il tuo codice esistente per salvare la prenotazione
                    
                    // Mostra il popup
                    const popup = document.getElementById('confirmation-popup');
                    popup.style.display = 'flex';
                    
                    // Gestisci il click sul pulsante OK
                    document.querySelector('.close-popup').addEventListener('click', function() {
                        popup.style.display = 'none';
                        window.location.href = '/'; // Reindirizza alla home
                    });
                    
                    // Reindirizza automaticamente dopo 3 secondi
                    setTimeout(() => {
                        popup.style.display = 'none';
                        window.location.href = '/';
                    }, 3000);
                    
                } catch (error) {
                    console.error('Errore:', error);
                    alert(error.message);
                }
            });
        }

        // Aggiorna il riepilogo quando lo step 3 diventa attivo
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    updateSummary();
                }
            });
        });

        observer.observe(step3, { attributes: true, attributeFilter: ['class'] });
    }
}); 