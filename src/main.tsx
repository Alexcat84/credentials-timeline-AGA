import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import { I18nProvider } from './i18n';
import { ColorSchemeProvider } from './theme/color-scheme';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ColorSchemeProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </ColorSchemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
