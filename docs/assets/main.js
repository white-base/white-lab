(() => {
  'use strict';

  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#primary-nav');
  const menuLabel = menuToggle?.querySelector('.menu-label');

  if (menuToggle && navigation) {
    const closeMenu = (restoreFocus = false) => {
      navigation.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      if (menuLabel) menuLabel.textContent = '메뉴 열기';
      if (restoreFocus) menuToggle.focus();
    };

    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      navigation.classList.toggle('is-open', !isOpen);
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      if (menuLabel) menuLabel.textContent = isOpen ? '메뉴 열기' : '메뉴 닫기';
    });

    navigation.addEventListener('click', (event) => {
      if (!event.target.closest('a')) return;
      if (menuToggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu(true);
      }
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.site-header')) closeMenu();
    });

    const desktopViewport = window.matchMedia('(min-width: 901px)');
    desktopViewport.addEventListener('change', () => closeMenu());
    menuToggle.hidden = false;
    document.documentElement.classList.add('js');
  }

  const diagramControls = document.querySelector('.diagram-switch');
  const diagram = document.querySelector('.logic-diagram');
  const diagramDescription = document.querySelector('#diagram-description');
  const explanations = {
    assembly: '필요한 모듈을 연결하고, 번들로 묶어 하나의 애플리케이션을 구성합니다.',
    ui: 'UI 모듈은 화면과 인터페이스를 구성하고, 필요한 계약에 맞는 기능을 제공합니다.',
    db: 'DB 모듈은 데이터 스키마를 정의합니다. 모듈 간 관계를 조합해 데이터 구조를 구성합니다.'
  };

  if (diagramControls && diagram && diagramDescription) {
    diagramControls.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-view]');
      const view = button?.dataset.view;
      if (!view || !Object.hasOwn(explanations, view)) return;
      for (const choice of diagramControls.querySelectorAll('button[data-view]')) {
        choice.setAttribute('aria-pressed', String(choice === button));
      }
      diagram.dataset.activeView = view;
      diagramDescription.textContent = explanations[view];
    });
    diagramControls.hidden = false;
  }

  const copyButton = document.querySelector('.copy-email');
  const copyStatus = document.querySelector('.copy-status');
  let copyReset;

  if (copyButton && copyStatus && navigator.clipboard?.writeText) {
    const label = copyButton.querySelector('span');
    copyButton.addEventListener('click', async () => {
      clearTimeout(copyReset);
      try {
        await navigator.clipboard.writeText(copyButton.dataset.email);
        if (label) label.textContent = '복사했습니다';
        copyStatus.textContent = '이메일 주소를 복사했습니다.';
      } catch {
        if (label) label.textContent = '다시 복사하기';
        copyStatus.textContent = '복사할 수 없습니다. 위의 이메일 주소를 직접 선택해 복사해 주세요.';
      }
      copyReset = setTimeout(() => {
        if (label) label.textContent = '이메일 주소 복사';
        copyStatus.textContent = '';
      }, 5000);
    });
    copyButton.hidden = false;
  }

  const year = document.querySelector('#copyright-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
