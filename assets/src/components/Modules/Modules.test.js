import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import apiFetch from "@wordpress/api-fetch";
import Modules from "./Modules";

jest.mock('@wordpress/api-fetch');

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Module Component", () => {
    test('it will check if loading text appears in the screen', () => {
        apiFetch.mockReturnValue( new Promise(() => {}));

        render(<Modules />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();        
    });

    test('it will check if module card appear in the document', async () => {
        apiFetch.mockResolvedValue({
            success: true,
            data: {
                coupon_codes:        { label: 'Coupon Codes',        desc: 'Allow discount coupons on membership signup.' },
                trial_period:        { label: 'Trial Period',         desc: 'Offer free trial before charging.' },
                email_reminders:     { label: 'Email Reminders',      desc: 'Send automated renewal reminder emails.' },
                custom_fields:       { label: 'Custom Fields',        desc: 'Add custom fields to registration form.' },
                member_directory:    { label: 'Member Directory',     desc: 'Show a public list of members.' },
                content_restriction: { label: 'Content Restriction',  desc: 'Restrict posts/pages to members only.' },
            }
        });

        render(<Modules />);

        await waitFor(() => {
            expect(screen.getByText('Coupon Codes')).toBeInTheDocument();
            expect(screen.getByText('Trial Period')).toBeInTheDocument();
            expect(screen.getByText('Email Reminders')).toBeInTheDocument();
            expect(screen.getByText('Custom Fields')).toBeInTheDocument();
            expect(screen.getByText('Member Directory')).toBeInTheDocument();
            expect(screen.getByText('Content Restriction')).toBeInTheDocument();
        })
    });

    test('it will check if toggle button can be clicked', async () => {
        apiFetch.mockResolvedValue({
            success: true,
            data: { coupon_codes: false }
        });

        render(<Modules />);

        const button = await screen.findByRole('switch', {name: /coupon codes/i});

        expect(button).toHaveAttribute('aria-checked', 'false');

        fireEvent.click(button);

        await waitFor(() => {
            expect(button).toHaveAttribute('aria-checked', 'true');
        });
    });
});