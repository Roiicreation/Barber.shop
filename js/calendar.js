import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { db } from './firebase-config.js';

async function checkBookedTimes(selectedDate) {
    try {
        const appointmentsRef = collection(db, 'appointments');
        const q = query(appointmentsRef, where("date", "==", selectedDate));
        const querySnapshot = await getDocs(q);
        
        const bookedTimes = [];
        querySnapshot.forEach(doc => {
            bookedTimes.push(doc.data().time);
        });
        
        return bookedTimes;
    } catch (error) {
        return [];
    }
}

document.addEventListener('click', async function(e) {
    if (e.target.classList.contains('calendar-day') && 
        !e.target.classList.contains('disabled') && 
        !e.target.classList.contains('empty')) {
        
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        e.target.classList.add('selected');
        
        const day = e.target.textContent;
        const monthYear = document.querySelector('.calendar-title').textContent;
        const dateObj = new Date(`${monthYear} ${day}`);
        
        const formattedDate = dateObj.toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        localStorage.setItem('selectedDate', formattedDate);
        
        await updateTimeSlots(formattedDate);
    }
});

async function updateTimeSlots(selectedDate) {
    try {
        const bookedTimes = await checkBookedTimes(selectedDate);
        const timeSlots = document.querySelectorAll('.time-slot');
        
        timeSlots.forEach(slot => {
            const time = slot.textContent.trim();
            
            const newSlot = slot.cloneNode(true);
            slot.parentNode.replaceChild(newSlot, slot);
            
            if (bookedTimes.includes(time)) {
                newSlot.classList.add('disabled');
                newSlot.style.cssText = `
                    background-color: #e9ecef !important;
                    cursor: not-allowed !important;
                    pointer-events: none !important;
                    opacity: 0.5 !important;
                `;
            } else {
                newSlot.addEventListener('click', function() {
                    timeSlots.forEach(s => s.classList.remove('selected'));
                    this.classList.add('selected');
                    localStorage.setItem('selectedTime', time);
                });
            }
        });
    } catch (error) {
        // Gestione silenziosa degli errori
    }
}

function updateCalendar(date) {
    const daysGrid = document.querySelector('.days-grid');
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const today = new Date();
    
    today.setHours(0, 0, 0, 0);
    
    daysGrid.innerHTML = '';
    
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        daysGrid.appendChild(emptyDay);
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
        currentDate.setHours(0, 0, 0, 0);
        
        const dayOfWeek = currentDate.getDay();
        const isSunday = dayOfWeek === 0;
        const isPastDay = currentDate < today;
        
        if (isSunday || isPastDay) {
            dayElement.classList.add('disabled');
            if (isPastDay) {
                dayElement.title = 'Data non disponibile';
            }
        } else {
            dayElement.addEventListener('click', async function() {
                document.querySelectorAll('.calendar-day').forEach(d => {
                    d.classList.remove('selected');
                });
                this.classList.add('selected');
                
                const monthNames = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 
                                  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
                const selectedDate = `${day} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                localStorage.setItem('selectedDate', selectedDate);
                
                await updateTimeSlots(selectedDate);
            });
        }
        
        if (currentDate.getTime() === today.getTime()) {
            dayElement.classList.add('today');
        }
        
        daysGrid.appendChild(dayElement);
    }
}

function handleMonthNavigation() {
    const prevMonthBtn = document.querySelector('.prev');
    const nextMonthBtn = document.querySelector('.next');
    const monthDisplay = document.querySelector('.calendar-title');
    
    if (!prevMonthBtn || !nextMonthBtn || !monthDisplay) {
        console.error('Elementi di navigazione calendario non trovati');
        return;
    }

    let currentDate = new Date(2024, 10, 1);

    function updateMonthDisplay() {
        const monthNames = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 
                          'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
        monthDisplay.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }

    prevMonthBtn.addEventListener('click', () => {
        if (currentDate.getMonth() === 11) {
            currentDate = new Date(2024, 10, 1);
            updateCalendar(currentDate);
            updateMonthDisplay();
            prevMonthBtn.style.visibility = 'hidden';
            nextMonthBtn.style.visibility = 'visible';
        }
    });

    nextMonthBtn.addEventListener('click', () => {
        if (currentDate.getMonth() === 10) {
            currentDate = new Date(2024, 11, 1);
            updateCalendar(currentDate);
            updateMonthDisplay();
            prevMonthBtn.style.visibility = 'visible';
            nextMonthBtn.style.visibility = 'hidden';
        }
    });

    updateCalendar(currentDate);
    updateMonthDisplay();
    prevMonthBtn.style.visibility = 'hidden';
}

document.addEventListener('DOMContentLoaded', () => {
    handleMonthNavigation();
});

export { updateTimeSlots };