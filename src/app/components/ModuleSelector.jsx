import { BookOpen, FileText, ChevronRight, FlaskConical } from 'lucide-react';

export const MODULES = [
    {
        id: 'congresos',
        label: 'Congresos',
        description: 'Conferencias y eventos científicos con fechas de envío, indexación y modalidad.',
        icon: BookOpen,
        color: '#f78e1e',
        bgGradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        borderColor: '#f78e1e',
        available: true,
    },
    {
        id: 'revistas',
        label: 'Revistas',
        description: 'Revistas científicas indexadas con factor de impacto, cuartiles y áreas temáticas.',
        icon: FileText,
        color: '#6366f1',
        bgGradient: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
        borderColor: '#6366f1',
        available: true,
    },
];

export default function ModuleSelector({ onSelectModule }) {
    return (
        <div className="module-selector">
            <div className="module-selector__hero">
                <div className="module-selector__logo">
                    <FlaskConical size={36} strokeWidth={1.5} />
                </div>
                <h1 className="module-selector__title">IDIC Research Hub</h1>
                <p className="module-selector__subtitle">
                    Selecciona el módulo que deseas explorar
                </p>
            </div>

            <div className="module-selector__grid">
                {MODULES.map((mod) => {
                    const Icon = mod.icon;
                    return (
                        <button
                            key={mod.id}
                            className={`module-card ${!mod.available ? 'module-card--disabled' : ''}`}
                            onClick={() => mod.available && onSelectModule(mod.id)}
                            style={{
                                '--mod-color': mod.color,
                                '--mod-bg': mod.bgGradient,
                                '--mod-border': mod.borderColor,
                            }}
                            disabled={!mod.available}
                        >
                            <div className="module-card__icon-wrap">
                                <Icon size={32} strokeWidth={1.5} />
                            </div>
                            <div className="module-card__body">
                                <h2 className="module-card__name">{mod.label}</h2>
                                <p className="module-card__desc">{mod.description}</p>
                            </div>
                            <div className="module-card__arrow">
                                {mod.available
                                    ? <ChevronRight size={20} />
                                    : <span className="module-card__soon">Próximamente</span>
                                }
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
