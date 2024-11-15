import React from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar, Doughnut } from 'react-chartjs-2';

const StatsPanel = ({ stats }) => {
    const monthlyData = {
        labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
        datasets: [{
            label: 'Appuntamenti per Mese',
            data: Object.values(stats.byMonth),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    const serviceData = {
        labels: Object.keys(stats.byService),
        datasets: [{
            data: Object.values(stats.byService),
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)'
            ]
        }]
    };

    return (
        <div className="stats-panel">
            <div className="stats-summary">
                <div className="stat-card">
                    <h3>Totale Appuntamenti</h3>
                    <p className="stat-number">{stats.total}</p>
                </div>
                <div className="stat-card">
                    <h3>Media Mensile</h3>
                    <p className="stat-number">
                        {Math.round(stats.total / Object.keys(stats.byMonth).length)}
                    </p>
                </div>
            </div>

            <div className="stats-charts">
                <div className="chart-container">
                    <h3>Andamento Mensile</h3>
                    <Bar data={monthlyData} />
                </div>
                <div className="chart-container">
                    <h3>Distribuzione Servizi</h3>
                    <Doughnut data={serviceData} />
                </div>
            </div>
        </div>
    );
};

export default StatsPanel; 