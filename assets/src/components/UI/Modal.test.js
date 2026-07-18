import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';
import '@testing-library/jest-dom';

// Mock @wordpress/components to avoid test environment conflicts
jest.mock('@wordpress/components', () => ({
    Modal: ({ title, children, onRequestClose }) => (
        <div role="dialog">
            <h1>{title}</h1>
            <button onClick={onRequestClose} aria-label="Close">X</button>
            <div>{children}</div>
        </div>
    ),
}));

describe('Modal Component', () => {

    test('does not render when isOpen is false', () => {
        render(
            <Modal isOpen={false} onClose={() => { }} title="Test Modal">
                <p>Modal Content</p>
            </Modal>
        );
        // Expect nothing to render when closed
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('renders title and content when isOpen is true', () => {
        render(
            <Modal isOpen={true} onClose={() => { }} title="Test Modal">
                <p>Modal Content</p>
            </Modal>
        );

        // Verify mocked title and content render
        expect(screen.getByText('Test Modal')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    test('calls onClose when closed', () => {
        const handleClose = jest.fn();
        render(
            <Modal isOpen={true} onClose={handleClose} title="Test Modal">
                <p>Content</p>
            </Modal>
        );

        // Click close button (mocked component)
        fireEvent.click(screen.getByRole('button', { name: /Close/i }));

        // Verify onClose was called
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});