import React, { useState, useEffect } from 'react';
import { bookingService } from '../../models/database';
import Calendar from '../../components/Calendar/Calendar';
import StatsPanel from './components/StatsPanel';
import AppointmentsList from './components/AppointmentsList';
import './Dashboard.css';

const Dashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [appointmentsData, statsData] = await Promise.all([
                    bookingService.getAllAppointments(),
                    bookingService.getAppointmentStats()
                ]);
                
                setAppointments(appointmentsData);
                setStats(statsData);
            } catch (error) {
                console.error('Errore nel caricamento dei dati:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (loading) {
        return <div className="loading">Caricamento...</div>;
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Dashboard Gestione</h1>
                <div className="actions">
                    <button className="btn-primary">Nuovo Appuntamento</button>
                    <button className="btn-secondary">Esporta Report</button>
                </div>
            </header>

            <div className="dashboard-grid">
                <div className="calendar-section">
                    <Calendar appointments={appointments} />
                </div>

                <div className="stats-section">
                    <StatsPanel stats={stats} />
                </div>

                <div className="appointments-section">
                    <AppointmentsList appointments={appointments} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
