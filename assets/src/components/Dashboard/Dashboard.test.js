import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from './Dashboard';
import apiFetch from "@wordpress/api-fetch";

// Mock apiFetch
jest.mock('@wordpress/api-fetch');

// Mock WordPress i18n
jest.mock('@wordpress/i18n', () => ({
    __: (text) => text,
}));

// Mock WordPress components — explicit mocks (faster than requireActual)
jest.mock('@wordpress/components', () => ({
    Spinner: () => <div data-testid="spinner">Loading...</div>,
    Button: ({ children, onClick, variant, className }) => (
        <button onClick={onClick} className={className}>{children}</button>
    ),
    SelectControl: ({ label, value, onChange, options, ...props }) => (
        <label>
            {label}
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                {(options || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </label>
    ),
    Card: ({ children, className }) => <div className={className}>{children}</div>,
    CardHeader: ({ children }) => <div>{children}</div>,
    CardBody: ({ children, className }) => <div className={className}>{children}</div>,
    __experimentalText: ({ children, className, as: Tag = 'span', ...props }) => (
        <Tag className={className}>{children}</Tag>
    ),
    SnackbarList: ({ notices }) => (
        <div data-testid="snackbar-list">
            {notices && notices.map((notice) => (
                <div key={notice.id}>{notice.content}</div>
            ))}
        </div>
    ),
}));

// Mock the Layout components
jest.mock('../Layout/MainLayout', () => {
    return function MockMainLayout({ children, title, subtitle }) {
        return (
            <div data-testid="main-layout">
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
                {children}
            </div>
        );
    };
});

jest.mock('../UI/Card', () => {
    return function MockCard({ children, title, className }) {
        return (
            <div data-testid="card" className={className}>
                {title && <h3>{title}</h3>}
                {children}
            </div>
        );
    };
});

describe('MemberForge Dashboard', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    // Test loading state
    it('shows loading spinner initially', () => {
        // Don't resolve the promise immediately
        apiFetch.mockReturnValue(new Promise(() => { }));

        render(<Dashboard />);

        expect(screen.getByTestId('spinner')).toBeInTheDocument();
        // Use getAllByText since both spinner and text contain 'Loading'
        expect(screen.getAllByText(/Loading/i).length).toBeGreaterThan(0);
    });

    // Test successful data fetch
    it('fetches and displays dashboard stats', async () => {
        const mockStats = {
            active_members: 500,
            total_revenue: 10000,
            churn_rate: 1.5,
            avg_ltv: 420,
            growth_rate: 5,
        };

        apiFetch.mockResolvedValue({ success: true, data: mockStats });

        render(<Dashboard />);

        // Wait for loading to finish and data to display
        await waitFor(() => {
            expect(screen.getByText('500')).toBeInTheDocument();
        });

        // Check formatted revenue (should be with dollar sign)
        expect(screen.getByText(/\$10,000/)).toBeInTheDocument();

        // Check other stats (churn rate shown with suffix %)
        expect(screen.getByText(/1\.5/)).toBeInTheDocument();
        expect(screen.getByText(/\$420/)).toBeInTheDocument();
    });

    // Test error state
    it('shows error message when API fails', async () => {
        // Expect console.error to be called (WordPress jest-console requirement)
        jest.spyOn(console, 'error').mockImplementation(() => { });

        apiFetch.mockRejectedValue(new Error('API Error'));

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/Error loading data/i)).toBeInTheDocument();
        });

        // Check for retry button
        expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();

        // Restore console.error
        console.error.mockRestore();
    });

    // Test that apiFetch is called with correct path
    it('calls apiFetch with correct endpoint', async () => {
        apiFetch.mockResolvedValue({
            success: true, data: {
                active_members: 100,
                total_revenue: 5000,
                churn_rate: 2.0,
                avg_ltv: 300,
            }
        });

        render(<Dashboard />);

        await waitFor(() => {
            expect(apiFetch).toHaveBeenCalledWith({ path: '/members-forge/v1/stats' });
        });
    });

    // Test that chart section renders
    it('renders chart sections', async () => {
        apiFetch.mockResolvedValue({
            success: true, data: {
                active_members: 100,
                total_revenue: 5000,
                churn_rate: 2.0,
                avg_ltv: 300,
            }
        });

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Revenue Over Time')).toBeInTheDocument();
            expect(screen.getByText('Member Growth')).toBeInTheDocument();
        });
    });

    // Test stat labels are displayed
    it('displays all stat labels', async () => {
        apiFetch.mockResolvedValue({
            success: true, data: {
                active_members: 1248,
                total_revenue: 24590,
                churn_rate: 2.4,
                avg_ltv: 420,
            }
        });

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/Monthly Recurring Revenue/i)).toBeInTheDocument();
            expect(screen.getByText(/Active Members/i)).toBeInTheDocument();
            expect(screen.getByText(/Churn Rate/i)).toBeInTheDocument();
            expect(screen.getByText(/Avg\. LTV/i)).toBeInTheDocument();
        });
    });
});