import { Modal as WPModal } from '@wordpress/components';

const Modal = ({ isOpen, title, onClose, children, ...props }) => {
    if (!isOpen) {
        return null;
    }
    return (
        <WPModal
            title={title}
            onRequestClose={onClose}
            {...props}
        >
            {children}
        </WPModal>
    )
}

export default Modal;