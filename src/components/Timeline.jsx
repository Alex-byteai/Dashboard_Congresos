import React from 'react';
import { Clock, MapPin } from 'lucide-react';

export default function Timeline({ events, getUrgencyClass }) {
    if (events.length === 0) return null;

    // 1. Sort events by start date
    const sortedEvents = [...events].sort((a, b) => {
        if (!a.fechaInicio) return 1
        if (!b.fechaInicio) return -1
        return new Date(a.fechaInicio) - new Date(b.fechaInicio)
    })

    // 2. Group by month
    const grouped = sortedEvents.reduce((groups, event) => {
        const m = event.month || 'Fecha por confirmar'
        if (!groups[m]) groups[m] = []
        groups[m].push(event)
        return groups
    }, {})

    // Sort Month Groups
    const sortedGroupKeys = Object.keys(grouped).sort((a, b) => {
        if (a === 'Fecha por confirmar') return 1
        if (b === 'Fecha por confirmar') return -1
        const dateA = new Date(grouped[a][0].fechaInicio)
        const dateB = new Date(grouped[b][0].fechaInicio)
        return dateA - dateB
    })

    return (
        <div className="timeline">
            {sortedGroupKeys.map((month) => (
                <div key={month}>
                    <div className="timeline-month">{month}</div>
                    {grouped[month].map((event, idx) => (
                        <div key={event.id} className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <div className="timeline-date">{event.fechaInicio}</div>
                                <h4 className="timeline-title">
                                    {event.evento}
                                </h4>
                                <p className="timeline-subtitle">{event.nombreCompleto}</p>
                                <div className="timeline-meta">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={14} />
                                        {event.pais}
                                    </div>
                                    <span className={`timeline-badge ${getUrgencyClass(event.deadlineDays)}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={14} />
                                        {event.deadline ? `Deadline: ${event.deadline}` : 'Fecha pendiente'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
