import React, { useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const AppointmentsList = ({ appointments }) => {
    const [filter, setFilter] = useState('all');
    
    const filteredAppointments = appointments.filter(apt => {
        if (filter === 'today') {
            return apt.date === format(new Date(), 'yyyy-MM-dd');
        }
        if (filter === 'upcoming') {
            return new Date(`${apt.date} ${apt.time}`) > new Date();
        }
        return true;
    });

    return (
        <div className="appointments-list">
            <div className="list-header">
                <h3>Appuntamenti</h3>
                <div className="filter-buttons">
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Tutti
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
                        onClick={() => setFilter('today')}
                    >
                        Oggi
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setFilter('upcoming')}
                    >
                        Prossimi
                    </button>
                </div>
            </div>

            <div className="appointments-table">
                {filteredAppointments.map(apt => (
                    <div key={apt.id} className="appointment-row">
                        <div className="appointment-time">
                            {format(new Date(`${apt.date} ${apt.time}`), 'dd MMM HH:mm', { locale: it })}
                        </div>
                        <div className="appointment-details">
                            {/* Add your appointment details here */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AppointmentsList; 