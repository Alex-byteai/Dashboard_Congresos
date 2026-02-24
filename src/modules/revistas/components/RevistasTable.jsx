import React, { useMemo, useState } from 'react';
import { ExternalLink, ArrowUpDown, SearchX } from 'lucide-react';

export default function RevistasTable({ revistas }) {
    const [sort, setSort] = useState({ key: 'journal', dir: 'asc' });

    const sorted = useMemo(() => {
        const dir = sort.dir === 'asc' ? 1 : -1;
        return [...revistas].sort((a, b) => {
            const av = (a?.[sort.key] || '').toString().toLowerCase();
            const bv = (b?.[sort.key] || '').toString().toLowerCase();
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
            return 0;
        });
    }, [revistas, sort]);

    const toggleSort = (key) => {
        setSort(prev => {
            if (prev.key !== key) return { key, dir: 'asc' };
            return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
        });
    };

    if (revistas.length === 0) {
        return (
            <div className="empty-state">
                <SearchX size={64} className="empty-icon" />
                <h3>No se encontraron revistas</h3>
                <p>Intenta ajustar los filtros</p>
            </div>
        );
    }

    return (
        <div className="table-card">
            <div className="table-wrapper">
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th style={{ width: '34%' }}>
                                <button className="table-sort" onClick={() => toggleSort('journal')}>
                                    Revista <ArrowUpDown size={14} />
                                </button>
                            </th>
                            <th>
                                <button className="table-sort" onClick={() => toggleSort('publisher')}>
                                    Publisher <ArrowUpDown size={14} />
                                </button>
                            </th>
                            <th>ISSN</th>
                            <th>Disciplinas</th>
                            <th style={{ textAlign: 'right' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((r) => (
                            <tr key={r.id}>
                                <td>
                                    <span className="table-event-name">{r.journal}</span>
                                    {r.enfoque && <span className="table-event-sub">{r.enfoque}</span>}
                                </td>
                                <td>{r.publisher || '-'}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ fontWeight: 600 }}>{r.issn || '-'}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.eissn || ''}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {(r.disciplinas || []).slice(0, 3).map(d => (
                                            <span key={d} className="badge badge-area">{d}</span>
                                        ))}
                                        {(r.disciplinas || []).length > 3 && (
                                            <span className="badge badge-area">+{(r.disciplinas || []).length - 3}</span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {r.sitioWeb ? (
                                        <a
                                            href={r.sitioWeb}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="table-link"
                                        >
                                            Visitar <ExternalLink size={14} />
                                        </a>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>N/A</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="table-footer">
                Mostrando {revistas.length} resultados
            </div>
        </div>
    );
}
