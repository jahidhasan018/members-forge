import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';
import Settings from './Settings';

jest.mock('@wordpress/api-fetch');

beforeEach(() => {
    jest.clearAllMocks();
});

// Mock settings data returned by API
const mockSettings = {
    success: true,
    data: {
        general:    { currency: 'USD', currency_position: 'before', date_format: 'Y-m-d', per_page: 20 },
        membership: { default_status: 'pending', trial_days: 0, grace_period_days: 0, allow_multiple: false },
        email:      { from_name: '', from_email: '', welcome_email: true, expiry_reminder: true, reminder_days: 7 },
        appearance: { primary_color: '#6366f1', account_page_id: 0, login_page_id: 0, after_login_redirect: 'account' },
    }
};

describe('Settings Component', () => {

    test('shows loading spinner while fetching settings', () => {
        // Keep API pending to show loading state
        apiFetch.mockReturnValue(new Promise(() => {}));
        render(<Settings />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test('renders tab navigation after loading', async () => {
        apiFetch.mockResolvedValue(mockSettings);
        render(<Settings />);

        await waitFor(() => {
            // Find tab buttons by role — exact match
            expect(screen.getByRole('button', { name: 'General' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Membership' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Email' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Appearance' })).toBeInTheDocument();
        });
    });

    test('shows General tab content by default', async () => {
        apiFetch.mockResolvedValue(mockSettings);
        render(<Settings />);

        await waitFor(() => {
            // "Currency" label exact match — not "Currency Position"
            expect(screen.getByText('Currency')).toBeInTheDocument();
        });
    });

    test('switches to Membership tab on click', async () => {
        apiFetch.mockResolvedValue(mockSettings);
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Membership' })).toBeInTheDocument();
        });

        // Click on tab button using role for specificity
        fireEvent.click(screen.getByRole('button', { name: 'Membership' }));

        await waitFor(() => {
            expect(screen.getByText(/default status/i)).toBeInTheDocument();
        });
    });

    test('shows error state when API fails', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        apiFetch.mockRejectedValue(new Error('Network error'));
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByText(/error/i)).toBeInTheDocument();
        });

        console.error.mockRestore();
    });
});