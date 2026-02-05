import { render } from '@wordpress/element';
import Dashboard from './components/Dashboard/Dashboard';
import './style.css';

const rootElement = document.getElementById('members-forge-app');

if (rootElement) {
    render(<Dashboard />, rootElement);
}