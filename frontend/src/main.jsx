import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

/**
 * Инициализирует React-приложение.
 * Находит корневой DOM-элемент и рендерит в него компонент {@link App}.
 */
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(<App />);