import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2'

export default function RevistasCharts({ revistas }) {

    const topDisciplines = useMemo(() => {
        const counts = {}
        for (const r of revistas) {
            for (const d of (r.disciplinas || [])) {
                counts[d] = (counts[d] || 0) + 1
            }
        }
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
        return {
            labels: sorted.map(x => x[0]),
            datasets: [{
                label: 'Revistas',
                data: sorted.map(x => x[1]),
                backgroundColor: '#6366f1',
                borderRadius: 4
            }]
        }
    }, [revistas])

    const topPublishers = useMemo(() => {
        const counts = {}
        for (const r of revistas) {
            const p = r.publisher
            if (!p) continue
            counts[p] = (counts[p] || 0) + 1
        }
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8)
        return {
            labels: sorted.map(x => x[0]),
            datasets: [{
                data: sorted.map(x => x[1]),
                backgroundColor: [
                    '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
                    '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'
                ],
                borderWidth: 0
            }]
        }
    }, [revistas])

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
                title="Disciplinas (Top 10)"
                subtitle="Revistas por disciplina"
            >
                <div style={{ width: '100%', height: '100%' }}>
                    <Bar data={topDisciplines} options={commonOptions} />
                </div>
            </ChartCard>

            <ChartCard
                title="Publishers (Top 8)"
                subtitle="Distribución por publisher"
            >
                <div style={{ width: '100%', height: '100%' }}>
                    <Doughnut data={topPublishers} options={pieOptions} />
                </div>
            </ChartCard>
        </div>
    );
}
