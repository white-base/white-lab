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

  for (const carousel of document.querySelectorAll('[data-carousel]')) {
    const slides = [...carousel.querySelectorAll('.carousel-slide')];
    const controls = carousel.querySelector('.carousel-controls');
    const previous = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    const dots = [...carousel.querySelectorAll('[data-carousel-dot]')];
    const playToggle = carousel.querySelector('[data-carousel-toggle]');
    const playLabel = playToggle?.querySelector('span');
    const count = carousel.querySelector('[data-carousel-count]');
    const status = carousel.querySelector('.carousel-status');
    if (slides.length < 2 || !controls || !previous || !next || !playToggle) continue;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const interval = 6000;
    let active = 0;
    let paused = false;
    let hovered = false;
    let focused = false;
    let inView = !('IntersectionObserver' in window);
    let timer;
    let touchStart;

    const syncPlayback = () => {
      clearTimeout(timer);
      playToggle.hidden = reducedMotion.matches;
      playToggle.dataset.paused = String(paused);
      playToggle.setAttribute('aria-label', paused ? '자동 재생 시작하기' : '자동 재생 멈추기');
      if (playLabel) playLabel.textContent = paused ? '자동 재생' : '일시 정지';
      const running = !paused && !reducedMotion.matches && !hovered && !focused && inView && !document.hidden;
      carousel.dataset.autoplay = running ? 'playing' : 'paused';
      if (running) {
        timer = setTimeout(() => {
          showSlide(active + 1);
          syncPlayback();
        }, interval);
      }
    };

    const showSlide = (index, announce = false) => {
      active = (index + slides.length) % slides.length;
      for (const [position, slide] of slides.entries()) {
        const selected = position === active;
        slide.classList.toggle('is-active', selected);
        slide.setAttribute('aria-hidden', String(!selected));
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', '슬라이드');
        slide.setAttribute('aria-label', `${position + 1} / ${slides.length}`);
      }
      for (const [position, dot] of dots.entries()) {
        dot.setAttribute('aria-pressed', String(position === active));
      }
      if (count) count.textContent = String(active + 1).padStart(2, '0');
      carousel.dataset.activeSlide = String(active + 1);
      if (announce && status) {
        status.textContent = `${active + 1} / ${slides.length}: ${slides[active].querySelector('h3')?.textContent || ''}`;
      }
    };

    const selectSlide = (index) => {
      paused = true;
      showSlide(index, true);
      syncPlayback();
    };

    previous.addEventListener('click', () => selectSlide(active - 1));
    next.addEventListener('click', () => selectSlide(active + 1));
    for (const [position, dot] of dots.entries()) {
      dot.addEventListener('click', () => selectSlide(position));
    }
    playToggle.addEventListener('click', () => {
      paused = !paused;
      if (!paused) {
        // An explicit play request also resumes while this control has focus.
        hovered = false;
        focused = false;
      }
      syncPlayback();
    });
    carousel.addEventListener('keydown', (event) => {
      const positions = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: slides.length - 1 };
      if (!Object.hasOwn(positions, event.key)) return;
      event.preventDefault();
      selectSlide(positions[event.key]);
    });
    carousel.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse') return;
      hovered = true;
      syncPlayback();
    });
    carousel.addEventListener('pointerleave', (event) => {
      if (event.pointerType !== 'mouse') return;
      hovered = false;
      syncPlayback();
    });
    carousel.addEventListener('focusin', () => {
      focused = true;
      syncPlayback();
    });
    carousel.addEventListener('focusout', (event) => {
      if (carousel.contains(event.relatedTarget)) return;
      focused = false;
      syncPlayback();
    });
    carousel.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'touch' || event.target.closest('button')) return;
      touchStart = { x: event.clientX, y: event.clientY };
    }, { passive: true });
    carousel.addEventListener('pointerup', (event) => {
      if (!touchStart) return;
      const dx = event.clientX - touchStart.x;
      const dy = event.clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) selectSlide(active + (dx < 0 ? 1 : -1));
    }, { passive: true });
    carousel.addEventListener('pointercancel', () => { touchStart = null; });
    reducedMotion.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);

    showSlide(0);
    carousel.classList.add('is-ready');
    controls.hidden = false;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio >= .25;
        if (inView) {
          for (const image of carousel.querySelectorAll('img')) image.loading = 'eager';
        }
        syncPlayback();
      }, { threshold: [0, .25] });
      observer.observe(carousel);
    }
    syncPlayback();
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
