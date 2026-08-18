(() => {
  const closeAll = () => {
    document.querySelectorAll('.language-switcher > div').forEach((panel) => {
      panel.classList.add('hidden');
    });
    document.querySelectorAll('.language-switcher > button').forEach((btn) => {
      btn.setAttribute('aria-expanded', 'false');
    });
  };

  document.querySelectorAll('.language-switcher').forEach((root) => {
    const btn = root.querySelector(':scope > button');
    const panel = root.querySelector(':scope > div');
    if (!btn || !panel) return;

    if (!btn.hasAttribute('aria-expanded')) {
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const willOpen = panel.classList.contains('hidden');
      closeAll();
      if (willOpen) {
        panel.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    panel.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  });

  document.addEventListener('click', closeAll);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAll();
  });
})();
