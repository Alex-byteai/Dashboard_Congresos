import React from 'react';
import { BookOpen, Building2, Layers } from 'lucide-react';

export default function RevistasStatsCards({ stats }) {
    return (
        <div className="stats-bar">
            <div className="stats-container">
                <div className="stat-card stat-card--revistas">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', color: '#0ea5e9' }}>
                        <BookOpen size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Revistas Indexadas</div>
                    </div>
                </div>
                <div className="stat-card stat-card--revistas">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', color: '#6366f1' }}>
                        <Layers size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.disciplinas}</div>
                        <div className="stat-label">Disciplinas</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
