import React from 'react';
import { Calendar, Users, MapPin, BookOpen } from 'lucide-react';

export default function Stats({ stats }) {
    return (
        <div className="stats-bar">
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-icon">
                        <Calendar size={28} />
                    </div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Eventos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <Users size={28} />
                    </div>
                    <div className="stat-value">{stats.urgent}</div>
                    <div className="stat-label">Deadlines Urgentes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <MapPin size={28} />
                    </div>
                    <div className="stat-value">{stats.countries}</div>
                    <div className="stat-label">Países</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <BookOpen size={28} />
                    </div>
                    <div className="stat-value">{stats.scopus}</div>
                    <div className="stat-label">Indexados Scopus</div>
                </div>
            </div>
        </div>
    );
}
