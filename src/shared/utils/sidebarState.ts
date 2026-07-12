import { useState, useEffect } from 'react';

// Store collapsed state per sidebar type
const collapsedStates: Record<string, boolean> = {
  admin: true,
  settings: true,
};

const listeners: Record<string, Set<(collapsed: boolean) => void>> = {
  admin: new Set(),
  settings: new Set(),
};

export const getSidebarCollapsed = (type: 'admin' | 'settings') => collapsedStates[type];

export const toggleSidebar = (type: 'admin' | 'settings') => {
  collapsedStates[type] = !collapsedStates[type];
  listeners[type].forEach(l => l(collapsedStates[type]));
};

export const useSidebarState = (type: 'admin' | 'settings') => {
  const [collapsed, setCollapsed] = useState(collapsedStates[type]);

  useEffect(() => {
    const handler = (val: boolean) => setCollapsed(val);
    listeners[type].add(handler);
    return () => {
      listeners[type].delete(handler);
    };
  }, [type]);

  return [collapsed, () => toggleSidebar(type)] as const;
};
