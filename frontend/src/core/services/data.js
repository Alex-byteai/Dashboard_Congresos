// Loads the JSON files published in /public. Requests are cached so the hub and
// the modules share a single fetch per file; a failed request is evicted so the
// next call retries it.
const cache = new Map()

const loadJson = (path) => {
    if (!cache.has(path)) {
        const request = fetch(path)
            .then(res => {
                if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
                return res.json()
            })
            .catch(err => {
                cache.delete(path)
                throw err
            })
        cache.set(path, request)
    }
    return cache.get(path)
}

export const loadCongresos = () => loadJson('/congresses.json')
export const loadRevistas = () => loadJson('/revistas.json')
export const loadRevistasObservadas = () => loadJson('/revistas_observadas.json')
