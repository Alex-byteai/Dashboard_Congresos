import { BookOpen } from '@phosphor-icons/react';

export default function RevistasStatsCards({ stats }) {
    return (
        <div className="stats-bar">
            <div className="stats-container">
                <div className="stat-card stat-card--revistas">
                    <div className="stat-icon" style={{ background: 'var(--pastel-blue-bg)', color: 'var(--pastel-blue-text)' }}>
                        <BookOpen size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Revistas Indexadas</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
