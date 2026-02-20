import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';
import '@testing-library/jest-dom';

// ১. @wordpress/components কে মক (Mock) করা
// এতে আমরা নিশ্চিত করছি যে আমাদের টেস্ট environment বা পোর্টাল নিয়ে ঝামেলা করবে না
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
        // কিছুই রেন্ডার হওয়া উচিত না
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('renders title and content when isOpen is true', () => {
        render(
            <Modal isOpen={true} onClose={() => { }} title="Test Modal">
                <p>Modal Content</p>
            </Modal>
        );

        // মক করা টাইটেল এবং কন্টেন্ট চেক করা
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

        // ক্লোজ বাটনে ক্লিক (মক করা বাটনে)
        fireEvent.click(screen.getByRole('button', { name: /Close/i }));

        // চেক করা যে ফাংশনটি কল হয়েছে কিনা
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});