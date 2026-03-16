import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid } from 'lucide-react'

import Header from '../../shared/components/Header'
import CareerFilter, { CAREERS } from '../../shared/components/CareerFilter'
import RevistasStatsCards from './components/RevistasStatsCards'
import RevistasFilterPanel from './components/RevistasFilterPanel'
import RevistasList from './components/RevistasList'

export default function RevistasModule({ onBack }) {
    const [loading, setLoading] = useState(true)
    const [revistas, setRevistas] = useState([])
    const [facets, setFacets] = useState({ tipos: [], disciplinas: [], categorias: [] })
    const [selectedCareers, setSelectedCareers] = useState([])

    const initialFilters = {
        search: '',
        tipo: '',
        disciplina: '',
        categorias: [],
        lineas: []
    }
    const [filters, setFilters] = useState(initialFilters)
    const [taxonomy, setTaxonomy] = useState({})

    const handleCareerSelect = (careerId) => {
        let newCareers = []
        if (!careerId) {
            newCareers = []
        } else {
            newCareers = selectedCareers.includes(careerId)
                ? selectedCareers.filter(id => id !== careerId)
                : [...selectedCareers, careerId]
        }

        setSelectedCareers(newCareers)

        // Sync categories based on selected careers
        const derivedCats = [...new Set(newCareers
            .map(id => CAREERS.find(c => c.id === id)?.categoria)
            .filter(Boolean))]

        setFilters(prev => ({
            ...prev,
            categorias: derivedCats,
            lineas: [] // Reset lines when changing careers/categories
        }))
    }

    useEffect(() => {
        fetch('/revistas.json')
            .then(res => res.json())
            .then(jsonData => {
                const fetchedRevistas = jsonData.revistas || []
                setRevistas(fetchedRevistas)
                setFacets(jsonData.facets || { tipos: [], disciplinas: [], categorias: [] })
                
                // Build dynamic taxonomy: { Category: [Lines] }
                const tax = {}
                fetchedRevistas.forEach(r => {
                    (r.clasificacion_ulima || []).forEach(item => {
                        const cat = item.Categoria_ULima
                        const line = item.Linea
                        if (cat && line) {
                            if (!tax[cat]) tax[cat] = new Set()
                            tax[cat].add(line)
                        }
                    })
                })
                // Convert Sets to sorted Arrays
                const finalTax = {}
                Object.keys(tax).forEach(cat => {
                    finalTax[cat] = [...tax[cat]].sort()
                })
                setTaxonomy(finalTax)
                
                setLoading(false)
            })
            .catch(err => {
                console.error('Error loading revistas:', err)
                setLoading(false)
            })
    }, [])

    const uniqueLineas = useMemo(() => {
        if (filters.categorias.length === 0) return []
        const lines = new Set()
        filters.categorias.forEach(cat => {
            (taxonomy[cat] || []).forEach(l => lines.add(l))
        })
        return [...lines].sort()
    }, [filters.categorias, taxonomy])

    const filtered = useMemo(() => {
        const q = filters.search.toLowerCase().trim()
        return revistas.filter(r => {
            const matchesSearch = !q ||
                r.journal?.toLowerCase().includes(q) ||
                r.publisher?.toLowerCase().includes(q) ||
                r.issn?.toLowerCase().includes(q) ||
                r.eissn?.toLowerCase().includes(q) ||
                r.enfoque?.toLowerCase().includes(q)

            const matchesTipo = !filters.tipo || r.tipo === filters.tipo
            const matchesDisciplina = !filters.disciplina || (r.disciplinas || []).includes(filters.disciplina)

            const journalClassification = r.clasificacion_ulima || []
            const journalCategories = journalClassification.map(c => c.Categoria_ULima)
            const journalLines = journalClassification.map(c => c.Linea)

            const matchesCategoria = filters.categorias.length === 0 ||
                filters.categorias.some(cat => journalCategories.includes(cat))
            
            const matchesLinea = filters.lineas.length === 0 ||
                filters.lineas.some(l => journalLines.includes(l))

            const selectedCareerCats = selectedCareers
                .map(id => CAREERS.find(c => c.id === id)?.categoria)
                .filter(Boolean)
            const matchesCareer = selectedCareerCats.length === 0 ||
                selectedCareerCats.some(cat => journalCategories.includes(cat))

            return matchesSearch && matchesTipo && matchesDisciplina && matchesCategoria && matchesLinea && matchesCareer
        })
    }, [filters, revistas, selectedCareers])

    const stats = useMemo(() => {
        return {
            total: filtered.length,
            disciplinas: new Set(filtered.flatMap(r => r.disciplinas || []).filter(Boolean)).size
        }
    }, [filtered])

    if (loading) return <div className="loader"><div className="spinner"></div></div>

    return (
        <>
            <Header onBack={onBack} moduleName="Revistas Científicas" />
            <RevistasStatsCards stats={stats} />

            <div className="container">
                <CareerFilter
                    selectedCareers={selectedCareers}
                    onSelect={handleCareerSelect}
                />

                <RevistasFilterPanel
                    filters={filters}
                    setFilters={setFilters}
                    tipos={facets.tipos || []}
                    disciplinas={facets.disciplinas || []}
                    categorias={facets.categorias || []}
                    lineas={uniqueLineas}
                    onReset={() => { setFilters(initialFilters); setSelectedCareers([]) }}
                />

                <RevistasList revistas={filtered} />
            </div>
        </>
    )
}
