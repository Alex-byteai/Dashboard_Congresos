import { BookOpen, FileText, ChevronRight } from 'lucide-react';

export const MODULES = [
    {
        id: 'congresos',
        label: 'Congresos',
        description: 'Encuentra congresos científicos evaluados según criterios de integridad y calidad editorial para apoyar una postulación informada.',
        icon: BookOpen,
        available: true,
    },
    {
        id: 'revistas',
        label: 'Revistas',
        description: 'Consulta informes de integridad y revisa información clave de revistas científicas para la elección del medio de publicación.',
        icon: FileText,
        available: true,
    },
];

export default function ModuleSelector({ onSelectModule }) {
    return (
        <div className="ulima-selector">
            <header className="ulima-selector__hero">
                <div className="ulima-hero-container">
                    <h1 className="ulima-selector__title">Instituto de Investigación Científica (IDIC)</h1>
                    <p className="ulima-selector__subtitle">
                        PORTAL DE INTEGRIDAD CIENTÍFICA PARA LA PUBLICACIÓN ACADÉMICA
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
                        <strong>Importante:</strong> La información presentada ha sido elaborada conforme a los protocolos y lineamientos institucionales orientados a resguardar la integridad científica de las publicaciones. Este portal constituye una herramienta de apoyo para la toma de decisiones sobre la elección de revistas y congresos por parte de investigadores con afiliación a la Universidad. Reúne información de medios previamente evaluados y en proceso de actualización continua. Su contenido tiene carácter orientador y no sustituye la evaluación académica ni la responsabilidad del equipo investigador en la selección del medio de publicación.
                    </p>
                    <p style={{ marginTop: '0.75rem' }}>
                        Para mayor información, revisa el <a href="https://www.ulima.edu.pe/sites/default/files/centers/files/protocolo_idoneidad_publicaciones_idic_v25jul_1.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'underline' }}>PROTOCOLO PARA LA EVALUACIÓN DE LA IDONEIDAD DE PUBLICACIONES CIENTÍFICAS</a>.
                    </p>
                </div>
            </main>
        </div>
    );
}

