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

    // Test 1: Verify all form fields render correctly
    test('renders all necessary fields', () => {
        render(<LevelForm onSave={() => { }} />);

        expect(screen.getByLabelText(/Level Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
        expect(screen.getByText(/Create Level/i)).toBeInTheDocument();
    });

    // Test 2: Verify onSave is called on form submission
    test('calls onSave with data when submitted', () => {
        const handleSave = jest.fn();
        render(<LevelForm onSave={handleSave} />);

        // Type name into input
        const nameInput = screen.getByLabelText(/Level Name/i);
        fireEvent.change(nameInput, { target: { value: 'Gold Plan' } });

        // Click save button
        const saveButton = screen.getByText(/Create Level/i);
        fireEvent.click(saveButton);

        // Verify onSave was called with correct data
        expect(handleSave).toHaveBeenCalledTimes(1);
        expect(handleSave).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Gold Plan'
        }));
    });
});