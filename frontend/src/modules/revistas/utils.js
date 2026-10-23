// `tipo_apc` values in revistas.json and the badge style for each one.
const APC_BADGES = {
    'Sin APC': 'badge--apc-free',
    'Con APC': 'badge--apc-paid',
    'APC opcional': 'badge--apc-optional',
};

export const APC_OPTIONS = Object.keys(APC_BADGES);

export const getApcBadgeClass = (apc) => APC_BADGES[apc] || 'badge--apc-default';

// Best (lowest) Scopus quartile across the journal's subject categories, e.g. 'Q1'.
export const getBestQuartile = (revista) =>
    (revista.categorias_scopus || [])
        .map(c => c.Cuartil)
        .filter(q => /^Q[1-4]$/.test(q))
        .sort()[0] || null;

// The sheet's "Base de datos" column is sometimes incomplete, but a WoS collection
// is only recorded for journals indexed in WoS, so either one counts.
export const isInWos = (revista) =>
    (revista.indexacion || []).includes('WoS') || Boolean(revista.coleccion_wos);

// Acronyms of the WoS collections: 'Science Citation Index Expanded (SCIE), Social
// Sciences Citation Index (SSCI)' → 'SCIE, SSCI'.
export const getWosCollections = (revista) =>
    (revista.coleccion_wos || '').match(/\(([^)]+)\)/g)?.map(s => s.slice(1, -1)).join(', ') || '';

// ISSNs are compared without hyphens, spaces or punctuation ('2045-2322' = '20452322').
// Shorter queries are ignored so that typing a few digits doesn't match half the list.
const MIN_ISSN_QUERY = 4;

export const normalizeIssn = (str) => String(str || '').replace(/[-\s.,]/g, '').toLowerCase();

export const matchesIssn = (journal, query) => {
    const target = normalizeIssn(query);
    return target.length >= MIN_ISSN_QUERY &&
        (normalizeIssn(journal.issn).includes(target) || normalizeIssn(journal.eissn).includes(target));
};
