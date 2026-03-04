import { useState, useEffect } from 'react';
import {
    Briefcase, Building2, Radio, Calculator, Scale,
    TrendingUp, Leaf, HardHat, Factory, Monitor,
    Cpu, Megaphone, Globe, Brain, ChevronDown, ChevronUp
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
    // State for collapsible categories
    const [expandedCats, setExpandedCats] = useState([]);

    // Group careers by category
    const groupedCareers = Object.keys(CATEGORY_COLOR).reduce((acc, cat) => {
        acc[cat] = CAREERS.filter(c => c.categoria === cat);
        return acc;
    }, {});

    // Effect to auto-expand categories that have selected careers
    useEffect(() => {
        const catsWithSelection = Object.entries(groupedCareers)
            .filter(([cat, careers]) => careers.some(c => selectedCareers.includes(c.id)))
            .map(([cat]) => cat);

        if (catsWithSelection.length > 0) {
            setExpandedCats(prev => [...new Set([...prev, ...catsWithSelection])]);
        }
    }, [selectedCareers]);

    const toggleCat = (cat) => {

        setExpandedCats(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    }

    return (
        <div className="career-filter">
            <div className="career-filter__header">
                <span className="career-filter__label">
                    Filtrado por Carrera y Área Temática
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

            <div className="career-filter__groups">
                {Object.entries(groupedCareers).map(([cat, careers]) => {
                    const colors = CATEGORY_COLOR[cat];
                    const isExpanded = expandedCats.includes(cat);

                    return (
                        <div key={cat} className={`career-group ${isExpanded ? 'career-group--expanded' : ''}`} style={{ '--group-color': colors.color }}>
                            <button className="career-group__title-btn" onClick={() => toggleCat(cat)}>
                                <h4 className="career-group__title">{cat}</h4>
                                <span className="career-group__icon">
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </span>
                            </button>

                            <div className="career-group__grid">
                                {careers.map((career) => {
                                    const Icon = career.icon;
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
                                        >
                                            <span className="career-chip__icon">
                                                <Icon size={16} strokeWidth={2} />
                                            </span>
                                            <span className="career-chip__name">{career.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
