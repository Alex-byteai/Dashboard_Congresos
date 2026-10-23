export const MODALITIES = ['Presencial', 'Híbrido', 'Virtual'];
export const UNDATED_MONTH = 'Fecha por confirmar';
const CLOSING_SOON_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const stripAccents = (str) => str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Dates in congresses.json are 'YYYY-MM-DD'. `new Date('YYYY-MM-DD')` parses them
// as UTC midnight, which in Lima (UTC-5) is the previous day; parse as local instead.
const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(`${dateStr}T00:00:00`);
    return isNaN(date.getTime()) ? null : date;
};

const startOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const daysUntil = (dateStr) => {
    const date = parseDate(dateStr);
    return date ? Math.round((date - startOfToday()) / DAY_MS) : null;
};

const hasEnded = (dateStr) => {
    const date = parseDate(dateStr);
    return date ? date < startOfToday() : false;
};

const getMonthLabel = (dateStr) => {
    const date = parseDate(dateStr);
    return date
        ? date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        : UNDATED_MONTH;
};

// The source sheet mixes 'Hibrido' and 'Híbrido'; map both to the canonical label.
const normalizeModality = (value) =>
    MODALITIES.find(m => stripAccents(m) === stripAccents(value || '')) || value;

// Reads the IDIC verdict ('good' | 'danger' | 'neutral') from the free-text conclusions.
const DANGER_TERMS = ['riesgo', 'no confiable', 'cuestionable', 'cautela'];
const GOOD_TERMS = ['confiable', 'no presenta indicios', 'favorable'];

const getVerdictStatus = (conclusiones) => {
    const text = (conclusiones || '').toLowerCase();
    if (!text) return 'neutral';
    if (DANGER_TERMS.some(term => text.includes(term)) ||
        (text.includes('malas prácticas') && !text.includes('no presenta'))) {
        return 'danger';
    }
    if (GOOD_TERMS.some(term => text.includes(term))) return 'good';
    return 'neutral';
};

const isOpen = (days) => days !== null && days >= 0;

// The three mutually exclusive states of a congress (event.status). `label` is the
// card pill; `heading` and `hint` title the card sections, in this order.
export const STATUSES = {
    open: {
        label: 'Convocatoria abierta',
        heading: 'Convocatorias abiertas',
        hint: 'Aún se pueden enviar trabajos',
    },
    closed: {
        label: 'Convocatoria cerrada',
        heading: 'Convocatorias cerradas',
        hint: 'El plazo de envío venció, pero el evento aún no se realiza',
    },
    finished: {
        label: 'Finalizado',
        heading: 'Eventos finalizados',
        hint: 'Eventos ya realizados, como referencia',
    },
};
export const STATUS_ORDER = Object.keys(STATUSES);

// An event without a known deadline has no open call, so it counts as 'closed'.
const getStatus = (deadlineDays, isPast) => {
    if (isPast) return 'finished';
    return isOpen(deadlineDays) ? 'open' : 'closed';
};

// Adds the derived fields every view relies on.
export const prepareCongress = (event) => {
    const publicacion = (event.publicacion || '').toLowerCase();
    const deadlineDays = daysUntil(event.deadline);
    const isPast = hasEnded(event.fechaFin);
    return {
        ...event,
        modalidad: normalizeModality(event.modalidad),
        deadlineDays,
        isPast,
        status: getStatus(deadlineDays, isPast),
        isScopus: publicacion.includes('scopus'),
        isIEEE: publicacion.includes('ieee'),
        isWoS: publicacion.includes('wos'),
        month: getMonthLabel(event.fechaInicio),
        verdict: getVerdictStatus(event.integridad?.conclusiones),
    };
};

export const getUrgencyClass = (days) => {
    if (days === null) return 'urgency-tbd';
    if (days < 0) return 'urgency-passed';
    if (days <= 15) return 'urgency-high';
    if (days <= CLOSING_SOON_DAYS) return 'urgency-medium';
    return 'urgency-low';
};

export const getUrgencyText = (days) => {
    if (days === null) return 'Fecha por definir';
    if (days < 0) return 'Vencido';
    if (days === 0) return 'Cierra hoy';
    return days === 1 ? '1 día' : `${days} días`;
};

// Status pill on each card. Open calls show the countdown in its urgency colour.
export const getStatusBadge = (event) => {
    const days = event.deadlineDays;
    if (event.status === 'open') {
        return { label: days === 0 ? 'Cierra hoy' : `Cierra en ${getUrgencyText(days)}`, className: getUrgencyClass(days) };
    }
    if (event.status === 'closed' && days === null) {
        return { label: 'Cierre por definir', className: 'urgency-tbd' };
    }
    return { label: STATUSES[event.status].label, className: 'urgency-tbd' };
};

// Status order first; then open calls by closest deadline, closed calls by
// soonest event and finished events most recent first.
export const compareByRelevance = (a, b) => {
    const rank = STATUS_ORDER.indexOf(a.status);
    if (a.status !== b.status) return rank - STATUS_ORDER.indexOf(b.status);
    if (a.status === 'open') return a.deadlineDays - b.deadlineDays;
    if (a.status === 'closed') return (a.fechaInicio || '9999').localeCompare(b.fechaInicio || '9999');
    return (b.fechaFin || '').localeCompare(a.fechaFin || '');
};

export const formatLocation = (event) =>
    event.ciudad ? `${event.ciudad}, ${event.pais}` : event.pais || 'Por confirmar';

// '16 feb 2026'
export const formatDate = (dateStr) => {
    const date = parseDate(dateStr);
    return date ? `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}` : 'Por definir';
};

// '15 – 17 jul 2026', '31 mar – 2 abr 2026' or '28 dic 2026 – 2 ene 2027'
export const formatDateRange = (event) => {
    const start = parseDate(event.fechaInicio);
    const end = parseDate(event.fechaFin);
    if (!start) return 'Por confirmar';
    if (!end || end.getTime() === start.getTime()) return formatDate(event.fechaInicio);
    if (start.getFullYear() !== end.getFullYear()) {
        return `${formatDate(event.fechaInicio)} – ${formatDate(event.fechaFin)}`;
    }
    const startLabel = start.getMonth() === end.getMonth()
        ? `${start.getDate()}`
        : `${start.getDate()} ${MONTHS[start.getMonth()]}`;
    return `${startLabel} – ${formatDate(event.fechaFin)}`;
};

export const toExternalUrl = (link) => {
    if (!link) return null;
    return /^https?:\/\//i.test(link) ? link : `https://${link}`;
};
