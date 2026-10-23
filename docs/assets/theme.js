(() => {
  'use strict';

  const storageKey = 'white-lab-theme';
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  let toggle;

  const readPreference = (value) => value === 'light' || value === 'dark' ? value : null;

  try {
    preference = readPreference(localStorage.getItem(storageKey));
  } catch {
    // The theme still works when browser storage is unavailable.
  }

  const applyTheme = () => {
    const theme = preference || (systemTheme.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content', theme === 'dark' ? '#101a22' : '#007eaf'
    );
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(theme === 'dark'));
      toggle.title = theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';
    }
  };

  // This script runs before the stylesheet to apply a saved theme before paint.
  applyTheme();
  systemTheme.addEventListener('change', () => {
    if (!preference) applyTheme();
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = readPreference(event.newValue);
    applyTheme();
  });

  document.addEventListener('DOMContentLoaded', () => {
    toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
      try {
        localStorage.setItem(storageKey, preference);
      } catch {
        // Keep the choice for this page even if it cannot be saved.
      }
    });
    applyTheme();
    toggle.hidden = false;
  });
})();
