const ANALYTICS_URL = import.meta.env.VITE_ANALYTICS_URL

const now = () => Date.now()

const uuid = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
    return `${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}-${now()}`
}

const getOrCreateSession = () => {
    try {
        const key = 'analytics_session'
        const ttlMs = 30 * 60 * 1000
        const raw = localStorage.getItem(key)
        if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed && parsed.id && parsed.lastSeen && now() - parsed.lastSeen < ttlMs) {
                const updated = { ...parsed, lastSeen: now() }
                localStorage.setItem(key, JSON.stringify(updated))
                return updated.id
            }
        }
        const created = { id: uuid(), lastSeen: now() }
        localStorage.setItem(key, JSON.stringify(created))
        return created.id
    } catch {
        return uuid()
    }
}

const getUtmParams = () => {
    try {
        const url = new URL(window.location.href)
        const params = url.searchParams
        const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
        return keys.reduce((acc, k) => {
            const v = params.get(k)
            if (v) acc[k] = v
            return acc
        }, {})
    } catch {
        return {}
    }
}

const postEvent = (payload) => {
    if (!ANALYTICS_URL) return

    const body = JSON.stringify(payload)

    try {
        if (navigator.sendBeacon) {
            const blob = new Blob([body], { type: 'application/json' })
            navigator.sendBeacon(ANALYTICS_URL.replace(/\/$/, '') + '/collect', blob)
            return
        }
    } catch {
        // ignore
    }

    fetch(ANALYTICS_URL.replace(/\/$/, '') + '/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        credentials: 'omit',
        keepalive: true,
    }).catch(() => {})
}

export const trackPageView = (extra = {}) => {
    const session_id = getOrCreateSession()
    postEvent({
        type: 'page_view',
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer || null,
        session_id,
        ...getUtmParams(),
        ...extra,
    })
}

export const trackEvent = (name, extra = {}) => {
    const session_id = getOrCreateSession()
    postEvent({
        type: 'event',
        name,
        path: window.location.pathname,
        referrer: document.referrer || null,
        session_id,
        ...getUtmParams(),
        ...extra,
    })
}
