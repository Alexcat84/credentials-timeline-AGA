import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useI18n } from '../i18n';

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

/** Translated fallback UI. Kept as a function so it can use the i18n hook (ErrorBoundary is a class). */
function ErrorFallback({ error }: { error: Error }) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 p-6">
      <p className="text-red-600 dark:text-red-400 font-semibold mb-2">{t('app.errorTitle')}</p>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 max-w-md text-center">{error.message}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600"
      >
        {t('app.reload')}
      </button>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
