import { MagnifyingGlassMinus } from '@phosphor-icons/react';

export default function EmptyState({ title, children }) {
    return (
        <div className="empty-state">
            <MagnifyingGlassMinus size={56} className="empty-icon" />
            <h3>{title}</h3>
            <p>Intenta ajustar o reiniciar los filtros de búsqueda</p>
            {children}
        </div>
    );
}
