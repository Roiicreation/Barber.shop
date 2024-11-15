function validateAndProceed() {
    // Previeni comportamento di default
    event.preventDefault();
    
    // Verifica selezioni
    const selectedDate = document.querySelector('.calendar-day.selected');
    const selectedTime = document.querySelector('.time-slot.selected');
    
    // Se mancano le selezioni
    if (!selectedDate || !selectedTime) {
        // Rimuovi eventuali messaggi di errore precedenti
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Crea nuovo messaggio di errore
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#dc3545';
        errorDiv.style.backgroundColor = '#f8d7da';
        errorDiv.style.border = '1px solid #f5c6cb';
        errorDiv.style.borderRadius = '4px';
        errorDiv.style.padding = '15px';
        errorDiv.style.margin = '10px 0';
        errorDiv.style.textAlign = 'center';
        
        // Imposta il messaggio appropriato
        errorDiv.textContent = !selectedDate && !selectedTime ? 
            'Per procedere devi selezionare sia una data che un orario' :
            !selectedDate ? 
                'Per procedere devi selezionare una data' :
                'Per procedere devi selezionare un orario';
        
        // Inserisci il messaggio di errore
        const bookingGrid = document.querySelector('.booking-grid');
        if (bookingGrid) {
            bookingGrid.insertBefore(errorDiv, bookingGrid.firstChild);
        }
        
        // Non procedere
        return false;
    }
    
    // Se tutto è valido, procedi allo step 3
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'block';
    
    return false;
}
