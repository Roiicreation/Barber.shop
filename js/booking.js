import { bookingSystem } from './booking-system.js';

document.addEventListener('DOMContentLoaded', () => {
    const confirmButton = document.querySelector('#step3 button[type="submit"]');
    
    if (confirmButton) {
        confirmButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                const selectedDate = localStorage.getItem('selectedDate');
                const selectedTime = localStorage.getItem('selectedTime');
                const selectedService = localStorage.getItem('selectedService');
                
                if (!selectedDate || !selectedTime || !selectedService) {
                    throw new Error('Seleziona tutti i campi richiesti');
                }
                
                const bookingData = {
                    date: selectedDate,
                    time: selectedTime,
                    service: selectedService,
                    name: document.querySelector('[name="name"]').value,
                    phone: document.querySelector('[name="phone"]').value,
                    status: 'pending'
                };
                
                await bookingSystem.saveBooking(bookingData);
                
                showConfirmationPopup();
                
                setTimeout(() => {
                    localStorage.clear();
                    window.location.href = '/';
                }, 3000);
                
            } catch (error) {
                console.error('Errore:', error);
                alert(error.message);
            }
        });
    }
});

function showConfirmationPopup() {
    const popup = document.createElement('div');
    popup.className = 'confirmation-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <i class="fas fa-check-circle"></i>
            <h3>Prenotazione Confermata!</h3>
            <p>Il tuo appuntamento è stato prenotato con successo.</p>
            <p class="redirect-text">Verrai reindirizzato alla home page tra pochi secondi...</p>
        </div>
    `;
    document.body.appendChild(popup);

    setTimeout(() => popup.classList.add('show'), 100);
}