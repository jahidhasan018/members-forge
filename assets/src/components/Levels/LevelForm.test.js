import { render, screen, fireEvent } from '@testing-library/react';
import LevelForm from './LevelForm';
import '@testing-library/jest-dom';

jest.mock('@wordpress/i18n', () => ({
    __: (text) => text,
}));

jest.mock('@wordpress/components', () => ({
    TextControl: ({ label, value, onChange, ...props }) => (
        <label>
            {label}
            <input value={value} onChange={(e) => onChange(e.target.value)} disabled={props.disabled} />
        </label>
    ),

    Button: ({ children, onClick, ...props }) => <button onClick={onClick}>{children}</button>,

    SelectControl: ({ label, value, onChange, options, ...props }) => (
        <label>
            {label}
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </label>
    ),

    TextareaControl: ({ label, value, onChange, ...props }) => (
        <label>
            {label}
            <textarea value={value} onChange={(e) => onChange(e.target.value)} />
        </label>
    ),

    ToggleControl: ({ label, checked, onChange, ...props }) => (
        <label>
            {label}
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        </label>
    ),

    __experimentalNumberControl: ({ label, value, onChange, ...props }) => (
        <label>
            {label}
            <input type="number" value={value} onChange={(e) => onChange(e.target.value)} />
        </label>
    ),
}));

describe('LevelForm Component', () => {

    // টেস্ট ১: ফর্ম ফিল্ডগুলো ঠিকমতো দেখাচ্ছে কিনা
    test('renders all necessary fields', () => {
        render(<LevelForm onSave={() => { }} />);

        expect(screen.getByLabelText(/Level Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
        expect(screen.getByText(/Create Level/i)).toBeInTheDocument();
    });

    // টেস্ট ২: ফর্ম সাবমিট করলে onSave কল হয় কিনা
    test('calls onSave with data when submitted', () => {
        const handleSave = jest.fn();
        render(<LevelForm onSave={handleSave} />);

        // নাম টাইপ করা
        const nameInput = screen.getByLabelText(/Level Name/i);
        fireEvent.change(nameInput, { target: { value: 'Gold Plan' } });

        // সেভ বাটনে ক্লিক
        const saveButton = screen.getByText(/Create Level/i);
        fireEvent.click(saveButton);

        // ভেরিফিকেশন
        expect(handleSave).toHaveBeenCalledTimes(1);
        // আমরা চেক করছি যে সেভ ফাংশনটি 'Gold Plan' ডাটা পেয়েছে কিনা
        expect(handleSave).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Gold Plan'
        }));
    });
});