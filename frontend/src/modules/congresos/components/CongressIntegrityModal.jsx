import Modal from '../../../shared/components/Modal';
import CongressIntegrityDetail from './CongressIntegrityDetail';
import { VERDICTS } from '../verdicts';

export default function CongressIntegrityModal({ event, onClose }) {
    if (!event) return null;

    const { icon, variant } = VERDICTS[event.verdict];

    return (
        <Modal
            isOpen
            onClose={onClose}
            icon={icon}
            iconVariant={variant}
            badge="Protocolo IDIC"
            badgeVariant={event.verdict === 'danger' ? 'danger' : 'default'}
            title={event.evento || 'Integridad del Congreso'}
            subtitle={event.nombreCompleto}
            maxWidth="820px"
        >
            <CongressIntegrityDetail event={event} />
        </Modal>
    );
}
