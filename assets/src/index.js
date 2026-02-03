import { render } from '@wordpress/element';
import App from './App';
import './style.css';

const rootElement = document.getElementById('members-forge-app');

if (rootElement) {
    render(<App />, rootElement);
}