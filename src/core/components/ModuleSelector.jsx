import { BookOpen, FileText, ChevronRight } from 'lucide-react';
import logoUlima from '../../image/Ulima.png';

export const MODULES = [
    {
        id: 'congresos',
        label: 'Congresos',
        description: 'Dashboard de conferencias científicas rigurosamente auditadas. Encuentra espacios confiables y libres de prácticas predatorias para presentar tus hallazgos.',
        icon: BookOpen,
        available: true,
    },
    {
        id: 'revistas',
        label: 'Revistas',
        description: 'Dashboard interactivo de revistas científicas validadas institucionalmente. Identifica cuartiles, áreas temáticas y publica con respaldo ético.',
        icon: FileText,
        available: true,
    },
];

export default function ModuleSelector({ onSelectModule }) {
    return (
        <div className="ulima-selector">
            <header className="ulima-selector__hero">
                <div className="ulima-hero-container">
                    <div className="ulima-brand-stack">
                        <img src={logoUlima} alt="Logo Ulima" className="ulima-brand-logo" />
                        <div className="ulima-logo-text">
                            <span className="logo-u">U</span>
                            <span className="logo-lima">Lima</span>
                        </div>
                    </div>
                    <h1 className="ulima-selector__title">Instituto de Investigación Científica (IDIC)</h1>
                    <p className="ulima-selector__subtitle">
                        Portal de Integridad Científica y Acompañamiento Metodológico
                    </p>
                </div>
            </header>

            <main className="ulima-selector__main">
                <div className="ulima-selector__grid">
                    {MODULES.map((mod) => {
                        const Icon = mod.icon;
                        return (
                            <button
                                key={mod.id}
                                className={`ulima-card ${!mod.available ? 'ulima-card--disabled' : ''}`}
                                onClick={() => mod.available && onSelectModule(mod.id)}
                                disabled={!mod.available}
                            >
                                <div className="ulima-card__content">
                                    <div className="ulima-card__icon-wrap">
                                        <Icon size={28} strokeWidth={1.5} />
                                    </div>
                                    <div className="ulima-card__body">
                                        <h2 className="ulima-card__name">{mod.label}</h2>
                                        <p className="ulima-card__desc">{mod.description}</p>
                                    </div>
                                </div>
                                <div className="ulima-card__footer">
                                    {mod.available ? (
                                        <span className="ulima-link">
                                            Ingresar al módulo <ChevronRight size={18} />
                                        </span>
                                    ) : (
                                        <span className="ulima-badge-soon">Próximamente</span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div style={{ marginTop: '4rem', maxWidth: '600px', textAlign: 'center', color: '#71717a', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <p>
                        <strong>Importante:</strong> Toda la información suministrada en estos módulos ha superado filtros de revisión de calidad.
                        Está diseñada para que nuestros investigadores y docentes publiquen y expongan sus trabajos con total seguridad institucional, maximizando la visibilidad de la Universidad de Lima.
                    </p>
                </div>
            </main>
        </div>
    );
}

