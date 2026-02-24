import {
    Briefcase, Building2, Radio, Calculator, Scale,
    TrendingUp, Leaf, HardHat, Factory, Monitor,
    Cpu, Megaphone, Globe, Brain
} from 'lucide-react';

export const CAREERS = [
    { id: 'administracion', label: 'Administración', icon: Briefcase, categoria: 'GESTIÓN Y ECONOMÍA DEL CONOCIMIENTO' },
    { id: 'arquitectura', label: 'Arquitectura', icon: Building2, categoria: 'DESARROLLO SOSTENIBLE Y MEDIOAMBIENTE' },
    { id: 'comunicacion', label: 'Comunicación', icon: Radio, categoria: 'SOCIEDAD Y COMPORTAMIENTO HUMANO' },
    { id: 'contabilidad', label: 'Contabilidad y Finanzas', icon: Calculator, categoria: 'GESTIÓN Y ECONOMÍA DEL CONOCIMIENTO' },
    { id: 'derecho', label: 'Derecho', icon: Scale, categoria: 'SOCIEDAD Y COMPORTAMIENTO HUMANO' },
    { id: 'economia', label: 'Economía', icon: TrendingUp, categoria: 'GESTIÓN Y ECONOMÍA DEL CONOCIMIENTO' },
    { id: 'ing-ambiental', label: 'Ing. Ambiental', icon: Leaf, categoria: 'DESARROLLO SOSTENIBLE Y MEDIOAMBIENTE' },
    { id: 'ing-civil', label: 'Ing. Civil', icon: HardHat, categoria: 'DESARROLLO SOSTENIBLE Y MEDIOAMBIENTE' },
    { id: 'ing-industrial', label: 'Ing. Industrial', icon: Factory, categoria: 'INNOVACIÓN Y TECNOLOGÍA DIGITAL' },
    { id: 'ing-sistemas', label: 'Ing. de Sistemas', icon: Monitor, categoria: 'INNOVACIÓN Y TECNOLOGÍA DIGITAL' },
    { id: 'ing-mecatronica', label: 'Ing. Mecatrónica', icon: Cpu, categoria: 'INNOVACIÓN Y TECNOLOGÍA DIGITAL' },
    { id: 'marketing', label: 'Marketing', icon: Megaphone, categoria: 'GESTIÓN Y ECONOMÍA DEL CONOCIMIENTO' },
    { id: 'negocios-internac', label: 'Negocios Internacionales', icon: Globe, categoria: 'GESTIÓN Y ECONOMÍA DEL CONOCIMIENTO' },
    { id: 'psicologia', label: 'Psicología', icon: Brain, categoria: 'SOCIEDAD Y COMPORTAMIENTO HUMANO' },
];

const CATEGORY_COLOR = {
    'GESTIÓN Y ECONOMÍA DEL CONOCIMIENTO': { color: '#f78e1e', bg: '#fff7ed' },
    'DESARROLLO SOSTENIBLE Y MEDIOAMBIENTE': { color: '#10b981', bg: '#ecfdf5' },
    'SOCIEDAD Y COMPORTAMIENTO HUMANO': { color: '#6366f1', bg: '#eef2ff' },
    'INNOVACIÓN Y TECNOLOGÍA DIGITAL': { color: '#0ea5e9', bg: '#f0f9ff' },
};

export default function CareerFilter({ selectedCareers, onSelect }) {
    return (
        <div className="career-filter">
            <div className="career-filter__header">
                <span className="career-filter__label">
                    Filtrar por carrera
                    {selectedCareers.length > 0 && (
                        <span className="career-filter__count">{selectedCareers.length} seleccionada{selectedCareers.length > 1 ? 's' : ''}</span>
                    )}
                </span>
                {selectedCareers.length > 0 && (
                    <button className="career-filter__clear" onClick={() => onSelect(null)}>
                        Limpiar selección
                    </button>
                )}
            </div>
            <div className="career-filter__grid">
                {CAREERS.map((career) => {
                    const Icon = career.icon;
                    const colors = CATEGORY_COLOR[career.categoria] || { color: '#f78e1e', bg: '#fff7ed' };
                    const isActive = selectedCareers.includes(career.id);
                    return (
                        <button
                            key={career.id}
                            className={`career-chip ${isActive ? 'career-chip--active' : ''}`}
                            style={{
                                '--career-color': colors.color,
                                '--career-bg': colors.bg,
                            }}
                            onClick={() => onSelect(career.id)}
                            title={career.categoria}
                        >
                            <span className="career-chip__icon">
                                <Icon size={18} strokeWidth={1.8} />
                            </span>
                            <span className="career-chip__name">{career.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="career-filter__legend">
                {Object.entries(CATEGORY_COLOR).map(([cat, { color, bg }]) => (
                    <span key={cat} className="career-legend-item" style={{ '--legend-color': color, '--legend-bg': bg }}>
                        <span className="career-legend-dot" />
                        {cat}
                    </span>
                ))}
            </div>
        </div>
    );
}
