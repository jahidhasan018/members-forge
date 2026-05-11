import { render, screen, waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';
import Dashboard from './Dashboard';

jest.mock('@wordpress/api-fetch');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Dashboard Component', () => {

    test('shows loading spinner while fetching stats', () => {
        apiFetch.mockReturnValue(new Promise(() => {}));
        render(<Dashboard />);
        expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
    });

    test('renders stat cards with real data from API', async () => {
        apiFetch.mockResolvedValue({
            success: true,
            data: {
                total_members:    50,
                active_members:   35,
                expired_members:  10,
                cancelled_members: 3,
                pending_members:   2,
            }
        });

        render(<Dashboard />);

        await waitFor(() => {
            // StatCard label গুলো দেখা যাচ্ছে কিনা
            expect(screen.getByText(/total members/i)).toBeInTheDocument();
            expect(screen.getByText(/active members/i)).toBeInTheDocument();
        });
    });

    test('shows error state when API call fails', async () => {
        // console.error কে mock করো — এটা expected তাই suppress করতে হবে
        jest.spyOn(console, 'error').mockImplementation(() => {});

        apiFetch.mockRejectedValue(new Error('Network error'));

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
        });

        // Test শেষে restore করো
        console.error.mockRestore();
    });
});