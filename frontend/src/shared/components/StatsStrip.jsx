// Summary pills above a result list. `tone` colours the icon: danger | success | info
// (omitted = accent).
export default function StatsStrip({ items }) {
    return (
        <div className="stats-strip">
            {items.map(({ icon: Icon, value, label, tone }) => (
                <div key={label} className="stat-pill">
                    <div className={`stat-pill__icon ${tone ? `stat-pill__icon--${tone}` : ''}`}>
                        <Icon size={18} />
                    </div>
                    <div>
                        <div className="stat-pill__value">{value}</div>
                        <div className="stat-pill__label">{label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
