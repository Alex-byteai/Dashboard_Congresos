import { Clock, MapPin } from '@phosphor-icons/react';
import EmptyState from '../../../shared/components/EmptyState';
import { getUrgencyClass, formatLocation, formatDate, formatDateRange } from '../utils';

export default function Timeline({ events }) {
    if (events.length === 0) {
        return <EmptyState title="No se encontraron congresos" />;
    }

    // ISO dates sort lexicographically; undated events go last. Grouping the
    // sorted list keeps the months in chronological order.
    const sorted = [...events].sort((a, b) => {
        if (!a.fechaInicio) return 1;
        if (!b.fechaInicio) return -1;
        return a.fechaInicio.localeCompare(b.fechaInicio);
    });
    const months = new Map();
    sorted.forEach(event => {
        if (!months.has(event.month)) months.set(event.month, []);
        months.get(event.month).push(event);
    });

    return (
        <div className="timeline">
            {[...months].map(([month, monthEvents]) => (
                <div key={month}>
                    <div className="timeline-month">{month}</div>
                    {monthEvents.map(event => (
                        <div key={event.id} className={`timeline-item ${event.isPast ? 'timeline-item--past' : ''}`}>
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <div className={`timeline-date ${event.isPast ? 'timeline-date--past' : ''}`}>
                                    {formatDateRange(event)}
                                </div>
                                <h4 className="timeline-title">{event.evento}</h4>
                                <p className="timeline-subtitle">{event.nombreCompleto}</p>
                                <div className="timeline-meta">
                                    <span className="timeline-meta__location">
                                        <MapPin size={14} />
                                        {formatLocation(event)}
                                    </span>
                                    <span className={`urgency-badge ${getUrgencyClass(event.deadlineDays)}`}>
                                        <Clock size={14} />
                                        Cierre: {formatDate(event.deadline)}
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
