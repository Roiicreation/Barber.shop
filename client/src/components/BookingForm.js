import { useState, useEffect, useRef } from 'react';
import { loadServices, loadStylists, createNewBooking } from '../utils/bookingUtils';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const BookingForm = () => {
    const [services, setServices] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [bookingData, setBookingData] = useState({
        service: '',
        stylist: '',
        date: '',
        time: ''
    });
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const calendarRef = useRef(null);

    useEffect(() => {
        const initializeData = async () => {
            try {
                const [servicesData, stylistsData] = await Promise.all([
                    loadServices(),
                    loadStylists()
                ]);
                setServices(servicesData);
                setStylists(stylistsData);
            } catch (error) {
                console.error('Errore nel caricamento dei dati:', error);
            }
        };

        initializeData();
    }, []);

    useEffect(() => {
        if (calendarRef.current) {
            const calendar = new Calendar(calendarRef.current, {
                plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
                initialView: 'dayGridMonth',
                selectable: true,
                selectMirror: true,
                weekends: true,
                businessHours: {
                    daysOfWeek: [1, 2, 3, 4, 5, 6], // Lunedì - Sabato
                    startTime: '09:00',
                    endTime: '19:00',
                },
                select: handleDateSelect,
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth'
                }
            });

            calendar.render();
            return () => calendar.destroy();
        }
    }, []);

    const handleDateSelect = async (selectInfo) => {
        const selectedDate = selectInfo.start;
        setSelectedDate(selectedDate);
        
        // Carica gli slot disponibili per la data selezionata
        if (bookingData.stylist) {
            try {
                const bookedSlots = await stylistService.getStylistAvailability(
                    bookingData.stylist,
                    selectedDate
                );
                
                // Genera tutti gli slot possibili dalle 9:00 alle 19:00
                const allSlots = generateTimeSlots('09:00', '19:00', 30);
                // Filtra gli slot già prenotati
                const available = allSlots.filter(slot => !bookedSlots.includes(slot));
                setAvailableSlots(available);
            } catch (error) {
                console.error('Errore nel caricamento degli slot:', error);
            }
        }
    };

    const generateTimeSlots = (start, end, interval) => {
        const slots = [];
        let current = new Date(`2000-01-01 ${start}`);
        const endTime = new Date(`2000-01-01 ${end}`);

        while (current < endTime) {
            slots.push(current.toLocaleTimeString('it-IT', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }));
            current.setMinutes(current.getMinutes() + interval);
        }
        return slots;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const bookingId = await createNewBooking({
                ...bookingData,
                userId: 'current-user-id' // Sostituire con l'ID utente effettivo
            });
            console.log('Prenotazione creata con successo:', bookingId);
            // Gestire il successo (es. reindirizzamento, notifica, ecc.)
        } catch (error) {
            console.error('Errore nella prenotazione:', error);
            // Gestire l'errore
        }
    };

    return (
        <div className="booking-container">
            <div className="calendar-wrapper">
                <div ref={calendarRef}></div>
            </div>

            {selectedDate && availableSlots.length > 0 && (
                <div className="time-slots-wrapper">
                    <h4>Orari disponibili</h4>
                    <div className="time-slots">
                        {availableSlots.map((slot) => (
                            <div
                                key={slot}
                                className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                                onClick={() => setSelectedTime(slot)}
                            >
                                {slot}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Altri campi del form */}
            </form>
        </div>
    );
};

export default BookingForm; 