import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';

const App = () => {
    const [count, setCount] = useState(0);

    return (
        <div className="members-forge-dashboard">
            <h1>🚀 Welcome to MembersForge Dashboard</h1>
            <p>This is a React powered Admin UI.</p>

            <div style={{ marginTop: '20px', padding: '20px', background: '#fff' }}>
                <p>Count: {count}</p>
                <Button variant="primary" onClick={() => setCount(count + 1)}>
                    Click Me to Count
                </Button>
            </div>
        </div>
    );
};

export default App;