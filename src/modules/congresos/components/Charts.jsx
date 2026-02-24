import React from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2'

export default function Charts({ data }) {

    const getCountData = (key) => {
        const counts = {}
        data.forEach(e => {
            const val = e[key]
            if (val) counts[val] = (counts[val] || 0) + 1
        })
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
        return {
            labels: sorted.map(i => i[0]),
            datasets: [{
                label: 'Eventos',
                data: sorted.map(i => i[1]),
                backgroundColor: '#f78e1e',
                borderRadius: 4
            }]
        }
    }

    const getModalityData = () => {
        const counts = {}
        data.forEach(e => { if (e.modalidad) counts[e.modalidad] = (counts[e.modalidad] || 0) + 1 })
        return {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
                borderWidth: 0
            }]
        }
    }

    const getMonthData = () => {
        const counts = {}
        data.forEach(e => {
            if (e.month && e.month !== 'Fecha por confirmar') {
                const m = e.month.charAt(0).toUpperCase() + e.month.slice(1)
                counts[m] = (counts[m] || 0) + 1
            }
        })

        const monthsOrder = [
            'enero de', 'febrero de', 'marzo de', 'abril de', 'mayo de', 'junio de',
            'julio de', 'agosto de', 'septiembre de', 'octubre de', 'noviembre de', 'diciembre de'
        ]

        const sortedKeys = Object.keys(counts).sort((a, b) => {
            const monthA = a.toLowerCase()
            const monthB = b.toLowerCase()
            const indexA = monthsOrder.findIndex(m => monthA.includes(m))
            const indexB = monthsOrder.findIndex(m => monthB.includes(m))
            if (indexA === -1) return 1
            if (indexB === -1) return -1
            return indexA - indexB
        })

        return {
            labels: sortedKeys,
            datasets: [{
                label: 'Eventos por mes',
                data: sortedKeys.map(k => counts[k]),
                borderColor: '#f78e1e',
                backgroundColor: 'rgba(247, 142, 30, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#f78e1e',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        }
    }

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { grid: { color: '#f3f4f6' }, border: { display: false } },
            x: { grid: { display: false }, border: { display: false } }
        }
    }

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8 } }
        }
    }

    const ChartCard = ({ title, subtitle, children }) => (
        <div className="chart-card">
            <div className="chart-header">
                <div className="chart-title">{title}</div>
                {subtitle && <div className="chart-subtitle">{subtitle}</div>}
            </div>
            <div className="chart-body">
                {children}
            </div>
        </div>
    )

    return (
        <div className="charts-container">
            <ChartCard
                title="Distribución Geográfica"
                subtitle="Top países con más eventos programados"
            >
                <div style={{ width: '100%', height: '100%' }}>
                    <Bar data={getCountData('pais')} options={commonOptions} />
                </div>
            </ChartCard>

            <ChartCard
                title="Calendario de Eventos"
                subtitle="Concentración de eventos por mes"
            >
                <div style={{ width: '100%', height: '100%' }}>
                    <Line data={getMonthData()} options={commonOptions} />
                </div>
            </ChartCard>

            <ChartCard
                title="Modalidad de Congreso"
                subtitle="Presencial vs Virtual vs Híbrido"
            >
                <div style={{ width: '100%', height: '100%' }}>
                    <Doughnut data={getModalityData()} options={pieOptions} />
                </div>
            </ChartCard>
        </div>
    );
}
