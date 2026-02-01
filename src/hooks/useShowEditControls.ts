import { useState } from 'react';

/**
 * Show edit-only controls (e.g. Enable pan) only when URL has ?edit=1.
 * Normal users never add that param, so they never see these controls.
 */
export function useShowEditControls(): boolean {
  const [show] = useState(
    () => typeof window !== 'undefined' && window.location.search.includes('edit=1')
  );
  return show;
}
