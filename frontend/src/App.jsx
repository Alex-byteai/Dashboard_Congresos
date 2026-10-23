import { useState, useEffect, useRef } from 'react'
import { IconContext } from '@phosphor-icons/react'

import ModuleSelector from './core/components/ModuleSelector'
import CongresosModule from './modules/congresos/CongresosModule'
import RevistasModule from './modules/revistas/RevistasModule'

const MODULES = {
    congresos: CongresosModule,
    revistas: RevistasModule,
}

function App() {
    // `route` is what is rendered; it only changes once the fade-out finishes.
    const [route, setRoute] = useState({ module: null, params: null })
    const [transitioning, setTransitioning] = useState(false)
    const timeoutRef = useRef(null)

    useEffect(() => () => clearTimeout(timeoutRef.current), [])

    // `params` lets a page open a module pre-filtered, e.g. { search } for revistas.
    const navigateTo = (module, params = null) => {
        if (module === route.module && !params) return
        setTransitioning(true)
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            setRoute({ module, params })
            setTransitioning(false)
        }, 180)
    }

    const ActivePage = MODULES[route.module] || ModuleSelector

    return (
        <IconContext.Provider value={{ weight: 'bold' }}>
            <div
                className="app-transition"
                style={{ opacity: transitioning ? 0 : 1 }}
            >
                <ActivePage onNavigate={navigateTo} params={route.params} />
            </div>
        </IconContext.Provider>
    )
}

export default App
