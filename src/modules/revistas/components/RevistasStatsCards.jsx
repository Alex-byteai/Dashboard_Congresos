import React from 'react';
import { BookOpen, Building2, Layers } from 'lucide-react';

export default function RevistasStatsCards({ stats }) {
    return (
        <div className="stats-bar">
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-icon">
                        <BookOpen size={28} />
                    </div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Revistas</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <Building2 size={28} />
                    </div>
                    <div className="stat-value">{stats.publishers}</div>
                    <div className="stat-label">Publishers</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <Layers size={28} />
                    </div>
                    <div className="stat-value">{stats.disciplinas}</div>
                    <div className="stat-label">Disciplinas</div>
                </div>
            </div>
        </div>
    );
}
