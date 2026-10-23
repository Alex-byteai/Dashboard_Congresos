import {
    ChartBar, Cpu, Leaf, Users,
    Briefcase, Buildings, Radio, Calculator, Scales, TrendUp,
    HardHat, Factory, Monitor, Megaphone, Globe, Brain
} from '@phosphor-icons/react';

// ULima research categories. Each `id` is the exact string used in
// congresses.json (`categoria`) and revistas.json (`Categoria_ULima`).
export const CATEGORIES = [
    { id: 'GESTIÓN Y ECONOMÍA DEL CONOCIMIENTO', icon: ChartBar },
    { id: 'INNOVACIÓN Y TECNOLOGÍA DIGITAL', icon: Cpu },
    { id: 'DESARROLLO SOSTENIBLE Y MEDIOAMBIENTE', icon: Leaf },
    { id: 'SOCIEDAD Y COMPORTAMIENTO HUMANO', icon: Users },
];

export const CAREERS = [
    { id: 'administracion', label: 'Administración', icon: Briefcase, categoria: 'GESTIÓN Y ECONOMÍA DEL CONOCIMIENTO' },
    { id: 'arquitectura', label: 'Arquitectura', icon: Buildings, categoria: 'DESARROLLO SOSTENIBLE Y MEDIOAMBIENTE' },
    { id: 'comunicacion', label: 'Comunicación', icon: Radio, categoria: 'SOCIEDAD Y COMPORTAMIENTO HUMANO' },
    { id: 'contabilidad', label: 'Contabilidad y Finanzas', icon: Calculator, categoria: 'GESTIÓN Y ECONOMÍA DEL CONOCIMIENTO' },
    { id: 'derecho', label: 'Derecho', icon: Scales, categoria: 'SOCIEDAD Y COMPORTAMIENTO HUMANO' },
    { id: 'economia', label: 'Economía', icon: TrendUp, categoria: 'GESTIÓN Y ECONOMÍA DEL CONOCIMIENTO' },
    { id: 'ing-ambiental', label: 'Ing. Ambiental', icon: Leaf, categoria: 'DESARROLLO SOSTENIBLE Y MEDIOAMBIENTE' },
    { id: 'ing-civil', label: 'Ing. Civil', icon: HardHat, categoria: 'DESARROLLO SOSTENIBLE Y MEDIOAMBIENTE' },
    { id: 'ing-industrial', label: 'Ing. Industrial', icon: Factory, categoria: 'INNOVACIÓN Y TECNOLOGÍA DIGITAL' },
    { id: 'ing-sistemas', label: 'Ing. de Sistemas', icon: Monitor, categoria: 'INNOVACIÓN Y TECNOLOGÍA DIGITAL' },
    { id: 'ing-mecatronica', label: 'Ing. Mecatrónica', icon: Cpu, categoria: 'INNOVACIÓN Y TECNOLOGÍA DIGITAL' },
    { id: 'marketing', label: 'Marketing', icon: Megaphone, categoria: 'GESTIÓN Y ECONOMÍA DEL CONOCIMIENTO' },
    { id: 'negocios-internac', label: 'Negocios Internacionales', icon: Globe, categoria: 'GESTIÓN Y ECONOMÍA DEL CONOCIMIENTO' },
    { id: 'psicologia', label: 'Psicología', icon: Brain, categoria: 'SOCIEDAD Y COMPORTAMIENTO HUMANO' },
];

export const categoryOfCareer = (careerId) => CAREERS.find(c => c.id === careerId)?.categoria;

export const categoriesForCareers = (careerIds) =>
    [...new Set(careerIds.map(categoryOfCareer).filter(Boolean))];
