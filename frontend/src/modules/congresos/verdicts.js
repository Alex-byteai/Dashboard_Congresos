import { Info, ShieldCheck, ShieldWarning } from '@phosphor-icons/react';

// How each IDIC verdict (event.verdict, see prepareCongress) is presented.
// `label` is the card tooltip; `variant` is the Modal icon variant.
export const VERDICTS = {
    good: {
        icon: ShieldCheck,
        label: 'Dictamen favorable',
        title: 'Dictamen Favorable de Idoneidad',
        badge: 'Conforme Protocolo IDIC',
        variant: 'success',
    },
    danger: {
        icon: ShieldWarning,
        label: 'Requiere cautela',
        title: 'Alerta Editorial / Cautela',
        badge: 'Requiere Cautela',
        variant: 'danger',
    },
    neutral: {
        icon: Info,
        label: 'Sin veredicto explícito',
        title: 'Evaluación de Idoneidad Científica',
        badge: 'Evaluación IDIC',
        variant: 'default',
    },
};
