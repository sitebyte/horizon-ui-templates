import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useStatementGeneration,
  type GenerationLifecycle,
} from '../settlements/StatementGenerationContext';

/**
 * Floating toast shown when a statement generation is running but the user is NOT on the
 * Statements page. Also briefly shows a completion or error toast when the run finishes.
 */
export function BackgroundTaskToast() {
  const { lifecycle, active, statements, totalCount, failure } = useStatementGeneration();
  const location = useLocation();
  const navigate = useNavigate();

  const onStatementsPage = location.pathname === '/settlements/statements';

  const prevLifecycleRef = useRef<GenerationLifecycle>(lifecycle);
  const [completionToast, setCompletionToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    const prev = prevLifecycleRef.current;
    prevLifecycleRef.current = lifecycle;

    if (onStatementsPage) {
      setCompletionToast(null);
      return;
    }

    const wasRunning = prev === 'starting' || prev === 'running' || prev === 'reading';

    if (wasRunning && lifecycle === 'complete') {
      setCompletionToast({
        type: 'success',
        message: `${statements.length} statement${statements.length !== 1 ? 's' : ''} generated`,
      });
      const timer = setTimeout(() => setCompletionToast(null), 8000);
      return () => clearTimeout(timer);
    }

    if (wasRunning && lifecycle === 'failed') {
      setCompletionToast({
        type: 'error',
        message: failure?.Message ?? 'Statement generation failed',
      });
      const timer = setTimeout(() => setCompletionToast(null), 12000);
      return () => clearTimeout(timer);
    }
  }, [lifecycle, onStatementsPage, statements.length, failure]);

  if (onStatementsPage) return null;

  const isRunning = lifecycle === 'starting' || lifecycle === 'running' || lifecycle === 'reading';

  if (isRunning && active) {
    const stepLabel = active.CurrentStep === 'Valuation' ? 'Running valuation'
      : active.CurrentStep === 'Generating' ? 'Generating statements'
      : active.CurrentStep === 'Reading' ? 'Reading results'
      : 'Starting';
    const pct = totalCount > 0 ? Math.round((statements.length / totalCount) * 100) : 0;

    return (
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          minWidth: 300,
          padding: '12px 16px',
          borderRadius: 8,
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/settlements/statements')}
        title="Click to view statements"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Spinner />
          <span style={{ color: 'var(--color-text)', fontSize: 13, fontWeight: 500 }}>
            {stepLabel}…
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
          Started by {active.StartedByName}
        </div>
        {active.CurrentStep === 'Reading' && totalCount > 0 && (
          <>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {statements.length} of {totalCount} ({pct}%)
            </div>
            <div
              style={{
                marginTop: 6,
                height: 3,
                borderRadius: 2,
                background: 'var(--color-border)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  borderRadius: 2,
                  background: 'var(--color-accent)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  if (completionToast) {
    const isError = completionToast.type === 'error';
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          minWidth: 280,
          maxWidth: 400,
          padding: '12px 16px',
          borderRadius: 8,
          background: 'var(--color-surface-raised)',
          border: `1px solid ${isError ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          cursor: 'pointer',
        }}
        onClick={() => {
          navigate('/settlements/statements');
          setCompletionToast(null);
        }}
        title="Click to view statements"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>{isError ? '✖' : '✔'}</span>
          <span
            style={{
              color: isError ? '#ef4444' : '#22c55e',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {completionToast.message}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
          Click to view
        </div>
      </div>
    );
  }

  return null;
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 1s linear infinite' }}>
      <circle
        cx="8" cy="8" r="6" fill="none"
        stroke="var(--color-accent)" strokeWidth="2"
        strokeDasharray="28" strokeDashoffset="8"
        strokeLinecap="round"
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}
