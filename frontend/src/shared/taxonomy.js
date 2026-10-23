import {
    Scales, ChartLineUp, Cpu, Briefcase, GraduationCap, Heartbeat, City, Leaf, Plant,
    Buildings, Radio, Calculator, TrendUp, HardHat, Factory, Monitor, Megaphone, Globe, Brain
} from '@phosphor-icons/react';
import LINEAS from './lineas_investigacion.json';

// Icon for each priority line, in the official order of lineas_investigacion.json
const LINE_ICONS = [Scales, ChartLineUp, Cpu, Briefcase, GraduationCap, Heartbeat, City, Leaf, Plant];

// ULima priority research lines. `id` is the official name used in congresses.json
// (`linea`) and revistas.json (`clasificacion_ulima[].Linea`); `label` is the short chip text.
export const LINES = LINEAS.lineas.map((linea, i) => ({
    id: linea.nombre,
    label: linea.corto,
    icon: LINE_ICONS[i],
    sublineas: linea.sublineas,
}));

// Official line numbers (1–9) → ids
const lines = (...numbers) => numbers.map(n => LINES[n - 1].id);

// Lines each career works on (a career may belong to several)
export const CAREERS = [
    { id: 'administracion', label: 'Administración', icon: Briefcase, lineas: lines(1, 2, 4) },
    { id: 'arquitectura', label: 'Arquitectura', icon: Buildings, lineas: lines(7, 8) },
    { id: 'comunicacion', label: 'Comunicación', icon: Radio, lineas: lines(3, 5) },
    { id: 'contabilidad', label: 'Contabilidad y Finanzas', icon: Calculator, lineas: lines(1, 2) },
    { id: 'derecho', label: 'Derecho', icon: Scales, lineas: lines(1, 2) },
    { id: 'economia', label: 'Economía', icon: TrendUp, lineas: lines(1, 2, 5) },
    { id: 'ing-ambiental', label: 'Ing. Ambiental', icon: Leaf, lineas: lines(8, 9) },
    { id: 'ing-civil', label: 'Ing. Civil', icon: HardHat, lineas: lines(7, 8) },
    { id: 'ing-industrial', label: 'Ing. Industrial', icon: Factory, lineas: lines(4, 7, 9) },
    { id: 'ing-sistemas', label: 'Ing. de Sistemas', icon: Monitor, lineas: lines(3, 4) },
    { id: 'ing-mecatronica', label: 'Ing. Mecatrónica', icon: Cpu, lineas: lines(3, 4) },
    { id: 'marketing', label: 'Marketing', icon: Megaphone, lineas: lines(3, 4) },
    { id: 'negocios-internac', label: 'Negocios Internacionales', icon: Globe, lineas: lines(2, 4) },
    { id: 'psicologia', label: 'Psicología', icon: Brain, lineas: lines(5, 6) },
];

export const lineLabel = (lineId) => LINES.find(l => l.id === lineId)?.label;

export const linesOfCareer = (careerId) => CAREERS.find(c => c.id === careerId)?.lineas || [];

// Lines covered by the given careers, in the official order
export const linesForCareers = (careerIds) => {
    const covered = new Set(careerIds.flatMap(linesOfCareer));
    return LINES.map(l => l.id).filter(id => covered.has(id));
};

export const careersForLine = (lineId) => CAREERS.filter(c => c.lineas.includes(lineId));

// Sublines of the given lines that actually occur in the data, in the official order
export const sublinesFor = (lineIds, presentSublines) =>
    LINES.filter(l => lineIds.includes(l.id))
        .flatMap(l => l.sublineas)
        .filter(s => presentSublines.has(s));
