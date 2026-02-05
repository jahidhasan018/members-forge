import { Button, Snackbar, SnackbarList } from "@wordpress/components";
import { __ } from '@wordpress/i18n';
import { useState } from "react";

const Dashboard = () => {
    const [count, setCount] = useState(0);

    const [notices, setNotices] = useState([]);

    // Handle the count function
    const handleCount = () => {
        setCount(count + 1);

        const newNotice = {
            id: Date.now(),
            content: __('Count updated successfully!', 'members-forge'),
            status: 'success'
        }

        setNotices([...notices, newNotice]);

        setTimeout(() => {
            setNotices((currentNotices) =>
                currentNotices.filter((n) => n.id !== newNotice.id)
            );
        }, 3000);
    }

    // Handle Remove notice
    const removeNotice = () => {
        setNotices(notices.filter((notice) => notice.id !== id));
    }

    return (
        <div className="member-forge-dashboard p-10 font-sans">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <div className="p-8">
                    <div className="uppercase tracking-wide text-sm text-brand-600 font-semibold">
                        {__('MembersForge', 'member-forge')}
                    </div>
                    <h1 className="block mt-1 text-2xl text-slate-900 font-bold">
                        {__('Welcome to MembersForge', 'member-forge')}
                    </h1>

                    <div className="mt-6">
                        <p className="text-slate-500 mb-4">Current Count: <span className="font-bold text-slate-900">{count}</span></p>
                        <Button
                            variant="primary"
                            onClick={handleCount}
                            className="bg-brand-600 text-white px-4 py-2 rounded-lg shadow-brand hover:bg-brand-900 transition duration-300 font-medium">
                            {__('Click Me to Count', 'members-forge')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            <div className="fixed bottom-5 right-5 z-50">
                <SnackbarList
                    notices={notices}
                    className="components-snackbar-list"
                    onRemove={removeNotice}
                />
            </div>
        </div>
    )
}

export default Dashboard;