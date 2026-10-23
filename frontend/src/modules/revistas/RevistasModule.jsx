import { useEffect, useMemo, useState } from 'react'
import {
    BookOpen, Barcode, ShieldWarning, CurrencyCircleDollar, Medal, Star
} from '@phosphor-icons/react'

import DashboardLayout from '../../shared/components/DashboardLayout'
import LineFilter from '../../shared/components/LineFilter'
import StatsStrip from '../../shared/components/StatsStrip'
import { InfoPanelItem, InfoPanelSection, ProtocolPanelSection } from '../../shared/components/InfoPanel'
import useCatalogFilters from '../../shared/hooks/useCatalogFilters'
import { sublinesFor } from '../../shared/taxonomy'
import { SHOW_LINE_FILTER } from '../../shared/constants'
import { loadRevistas, loadRevistasObservadas } from '../../core/services/data'
import RevistasFilterPanel from './components/RevistasFilterPanel'
import RevistasList from './components/RevistasList'
import ReviewRequestModal from './components/ReviewRequestModal'
import BadPracticesModal from './components/BadPracticesModal'
import ObservedAlert from './components/ObservedAlert'
import { getBestQuartile, matchesIssn } from './utils'

// Titles shorter than this don't trigger the observed-journal alert
const MIN_TITLE_QUERY = 4

const EMPTY_FILTERS = {
    search: '',
    tipo: '',
    apc: '',
    disciplina: '',
    lineas: [],
    sublineas: []
}

// `params.search` comes from the hub's ISSN lookup ("Ver en el Catálogo").
export default function RevistasModule({ onNavigate, params }) {
    const [loading, setLoading] = useState(true)
    const [revistas, setRevistas] = useState([])
    const [revistasObservadas, setRevistasObservadas] = useState([])
    const [facets, setFacets] = useState({ tipos: [], disciplinas: [] })
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [showBadPractices, setShowBadPractices] = useState(false)
    const {
        filters, setFilters, selectedCareers, activeCount,
        toggleCareer, selectLine, removeLine, resetFilters
    } = useCatalogFilters(EMPTY_FILTERS, { search: params?.search || '' })

    useEffect(() => {
        Promise.all([
            loadRevistas(),
            loadRevistasObservadas().catch(() => ({ revistas_observadas: [] }))
        ])
            .then(([revData, obsData]) => {
                setRevistas((revData.revistas || []).map(r => ({ ...r, bestQuartile: getBestQuartile(r) })))
                setFacets({ tipos: revData.facets?.tipos || [], disciplinas: revData.facets?.disciplinas || [] })
                setRevistasObservadas(obsData.revistas_observadas || [])
            })
            .catch(err => console.error('Error loading revistas:', err))
            .finally(() => setLoading(false))
    }, [])

    // Sublines of the selected lines that some journal actually has
    const sublineas = useMemo(
        () => sublinesFor(filters.lineas, new Set(revistas.flatMap(r => (r.clasificacion_ulima || []).map(c => c.Sublinea)))),
        [filters.lineas, revistas]
    )

    const filtered = useMemo(() => {
        const q = filters.search.toLowerCase().trim()
        return revistas.filter(r => {
            const matchesSearch = !q ||
                r.journal?.toLowerCase().includes(q) ||
                r.publisher?.toLowerCase().includes(q) ||
                r.enfoque?.toLowerCase().includes(q) ||
                matchesIssn(r, q)
            const matchesTipo = !filters.tipo || r.tipo === filters.tipo
            const matchesApc = !filters.apc || r.tipo_apc === filters.apc
            const matchesDisciplina = !filters.disciplina || (r.disciplinas || []).includes(filters.disciplina)

            const classification = r.clasificacion_ulima || []
            const matchesLinea = filters.lineas.length === 0 ||
                filters.lineas.some(l => classification.some(c => c.Linea === l))
            const matchesSublinea = filters.sublineas.length === 0 ||
                filters.sublineas.some(s => classification.some(c => c.Sublinea === s))

            return matchesSearch && matchesTipo && matchesApc && matchesDisciplina && matchesLinea && matchesSublinea
        })
    }, [filters, revistas])

    // Observed journals aren't in the catalog, so a search for one would otherwise
    // just come back empty; they are matched by ISSN/E-ISSN or title.
    const observedMatches = useMemo(() => {
        const q = filters.search.toLowerCase().trim()
        if (!q) return []
        return revistasObservadas.filter(r =>
            matchesIssn(r, q) ||
            (q.length >= MIN_TITLE_QUERY && r.journal?.toLowerCase().includes(q))
        )
    }, [filters.search, revistasObservadas])

    const isQ1 = (r) => r.bestQuartile === 'Q1'
    const isFree = (r) => r.tipo_apc === 'Sin APC'
    const stats = [
        { icon: BookOpen, value: filtered.length, label: 'Revistas encontradas' }
    ]

    const handleViewJournal = (journal) => {
        setFilters(prev => ({ ...prev, search: journal.journal }))
        window.setTimeout(() => {
            document.querySelector(`[data-journal-id="${journal.id}"]`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 250)
    }

    const rightPanel = !loading && (
        <>
            <RevistasFilterPanel
                filters={filters}
                setFilters={setFilters}
                tipos={facets.tipos}
                disciplinas={facets.disciplinas}
                sublineas={sublineas}
                onLineRemove={removeLine}
                onReset={resetFilters}
            />

            <InfoPanelSection title="Alertas Editoriales">
                <InfoPanelItem
                    avatar={<ShieldWarning size={18} />}
                    tone="danger"
                    name="Revistas Observadas"
                    sub="Títulos con alerta de mala práctica"
                    aside={<span className="info-panel__badge info-panel__badge--danger">{revistasObservadas.length}</span>}
                    onClick={() => setShowBadPractices(true)}
                />
                <InfoPanelItem
                    avatar={<Barcode size={18} />}
                    name="Consulta de ISSN"
                    sub="Verificar o solicitar evaluación de una revista"
                    onClick={() => setShowReviewModal(true)}
                />
            </InfoPanelSection>

            <ProtocolPanelSection />
        </>
    )

    return (
        <DashboardLayout
            activeModule="revistas"
            onNavigate={onNavigate}
            searchValue={filters.search}
            onSearchChange={(val) => setFilters(prev => ({ ...prev, search: val }))}
            searchPlaceholder="Buscar por título, editorial, ISSN o enfoque..."
            rightPanel={rightPanel}
            panelBadge={activeCount}
            panelDoneLabel={`Ver ${filtered.length} ${filtered.length === 1 ? 'revista' : 'revistas'}`}
        >
            <div className="section-header">
                <div>
                    <h1 className="section-title">Revistas Científicas</h1>
                    <p className="section-subtitle">
                        Base de revistas evaluadas para la toma de decisiones informada
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="loader">
                    <div className="spinner"></div>
                </div>
            ) : (
                <>
                    {SHOW_LINE_FILTER && (
                        <LineFilter
                            lineas={filters.lineas}
                            selectedCareers={selectedCareers}
                            onSelectLine={selectLine}
                            onToggleCareer={toggleCareer}
                            allLabel="Todas"
                        />
                    )}

                    <StatsStrip items={stats} />

                    {observedMatches.length > 0 && (
                        <ObservedAlert
                            journals={observedMatches}
                            onShowRegistry={() => setShowBadPractices(true)}
                        />
                    )}

                    {/* When the search only matches observed journals, the alert is the answer */}
                    {(filtered.length > 0 || observedMatches.length === 0) && (
                        <RevistasList
                            revistas={filtered}
                            onRequestReview={() => setShowReviewModal(true)}
                        />
                    )}
                </>
            )}

            <ReviewRequestModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                revistas={revistas}
                revistasObservadas={revistasObservadas}
                onViewJournal={handleViewJournal}
            />

            <BadPracticesModal
                isOpen={showBadPractices}
                onClose={() => setShowBadPractices(false)}
                revistasMalas={revistasObservadas}
            />
        </DashboardLayout>
    )
}
