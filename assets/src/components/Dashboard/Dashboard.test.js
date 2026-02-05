import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from './Dashboard';
import { SnackbarList } from "@wordpress/components";

jest.mock('@wordpress/i18n', () => ({
    __: (text) => text,
}));

jest.mock('@wordpress/components', () => {
    const orginalModule = jest.requireActual('@wordpress/components');
    return {
        ...orginalModule,
        SnackbarList: ({ notices }) => (
            <div data-tested="snackbar-list">
                {notices.map((notice) => (
                    <div key={notice.id}>{notice.content}</div>
                ))}
            </div>
        )
    }
});

describe('MemberForge Dashboard', () => {
    it('renders the dashboard title', () => {
        render(<Dashboard />);
        expect(screen.getByText(/Welcome to MembersForge/i)).toBeInTheDocument();
    });

    it('shows a toaster notification when count button is clicked', async () => {
        const user = userEvent.setup();
        render(<Dashboard />)

        const button = screen.getByRole('button', { name: /Click Me to Count/i });

        await user.click(button);

        await waitFor(() => {
            expect(screen.getByText(/Count updated successfully/i)).toBeInTheDocument();
        })
    })
})