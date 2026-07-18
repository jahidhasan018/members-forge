/**
 * Members Component Test Suite
 * 
 * Tests covered:
 * 1. Loading state displays correctly
 * 2. Member list renders after successful API call
 * 3. Empty state shows when no members exist
 * 4. Status badges render for each member
 */

import { render, screen, waitFor } from '@testing-library/react';

// Mock apiFetch to avoid actual HTTP requests in test environment
import apiFetch from '@wordpress/api-fetch';
import Members from './Members';

jest.mock('@wordpress/api-fetch');

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});

describe('Members Component', () => {
    /**
     * Test case 1: Loading state
     * 
     * When the component is first rendered, it should show a loading message until the API call is complete.
     */
    test('shows loading spinner while fetching members', () => {
        // Make the api pending state by returning a promise.
        apiFetch.mockReturnValue(new Promise(() => {}));

        // Render the Members component
        render(<Members />);

        // Check if the loading message is displayed
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    /**
     * Test case 2: Member list rendering
     * 
     * If the API return members list then it should render the member name on the screen.
     */
    test('renders member list after successful API call', async () => {
        // Mock API response with sample member data
        apiFetch.mockResolvedValue({
            success: true,
            data: [
                { id: 1, user_id: 10, level_id: 1, status: 'active', display_name: 'John Doe', level_name: 'Gold' },
                { id: 2, user_id: 11, level_id: 2, status: 'pending', display_name: 'Jane Smith', level_name: 'Silver' },
            ]
        });

        // Render the Members component
        render(<Members />);

        // Needs waitFor the component to update after the API call
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    /**
     * Test case 3: Empty state
     * 
     * If the API returns an empty list, it should show a message
     * indicating that there are no members.
     * */
    test('shows empty state message when no members are found', async () =>{
        apiFetch.mockResolvedValue({ success: true, data: [] });

        // Render the components
        render(<Members />);

        await waitFor( () => {
            expect(screen.getByText(/no members found/i)).toBeInTheDocument();
        });
    });

    /**
     * Test case 4: Status badge render
     * 
     * Should Show every members status badge
     */
    test('displays membership status for each member', async () => {
        apiFetch.mockResolvedValue({ 
            success: true,
            data: [
                { id: 1, user_id: 10, level_id: 1, status: 'active', display_name: 'John Doe', level_name: 'Gold' },
            ]
        });

        render(<Members />);

        await waitFor( () => {
            expect(screen.getByText('active')).toBeInTheDocument();
        });
    });
});