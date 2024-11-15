import { useState, useEffect, useRef } from 'react';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { bookingService } from '../models/database';

const OwnerDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [view, setView] = useState('dayGridMonth');
    const calendarRef = useRef(null);

    useEffect(() => {
        const loadAppointments = async () => {
            try {
                // Carica tutti gli appuntamenti
                const allAppointments = await bookingService.getAllAppointments();
                setAppointments(allAppointments);
            } catch (error) {
                console.error('Errore nel caricamento appuntamenti:', error);
            }
        };

        loadAppointments();
    }, []);

    useEffect(() => {
        if (calendarRef.current) {
            const calendar = new Calendar(calendarRef.current, {
                plugins: [dayGridPlugin, timeGridPlugin],
                initialView: view,
                events: appointments.map(apt => ({
                    title: `${apt.service} - ${apt.clientName}`,
                    start: new Date(`${apt.date} ${apt.time}`),
                    end: new Date(new Date(`${apt.date} ${apt.time}`).getTime() + 30*60000)
                })),
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }
            });

            calendar.render();
            return () => calendar.destroy();
        }
    }, [appointments, view]);

    return (
        <div className="owner-dashboard">
            <h2>Dashboard Gestione</h2>
            <div className="calendar-container" ref={calendarRef}></div>
            
            {/* Sezione statistiche */}
            <div className="stats-section">
                <h3>Statistiche</h3>
                <div className="stats-grid">
                    <div className="stat-card">
                        <h4>Appuntamenti Oggi</h4>
                        <p>{appointments.filter(apt => 
                            apt.date === new Date().toISOString().split('T')[0]
                        ).length}</p>
                    </div>
                    {/* Altre statistiche... */}
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
