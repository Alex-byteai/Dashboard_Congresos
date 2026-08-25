import React from 'react';
import { ShieldCheck } from '@phosphor-icons/react';
import Modal from '../../../shared/components/Modal';
import CongressIntegrityDetail from './CongressIntegrityDetail';

export default function CongressIntegrityModal({ event, onClose }) {
    return (
        <Modal
            isOpen={!!event}
            onClose={onClose}
            icon={ShieldCheck}
            title={event?.evento || 'Integridad del congreso'}
            subtitle={event?.nombreCompleto}
        >
            <div style={{ padding: '1.5rem 2rem 2rem', overflowY: 'auto', background: 'var(--card-bg-alt)' }}>
                {event && <CongressIntegrityDetail event={event} />}
            </div>
        </Modal>
    );
}
