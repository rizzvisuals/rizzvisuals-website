(() => {
  const config = window.RIZZ_CONFIG;
  if (!config) return;
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];
  const escapeHtml = (str='') => str.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  document.documentElement.classList.add('js');
  window.addEventListener('load', () => document.body.classList.add('loaded'));
  const year = $('#year'); if (year) year.textContent = new Date().getFullYear();
  $$('[data-shop-link]').forEach(a => a.href = config.shopUrl);
  const email = $('#email-link'); if (email) email.href = `mailto:${config.email}?subject=RizzVisuals%20Inquiry`;

  const header = $('#site-header');
  const updateHeader = () => header && header.classList.toggle('scrolled', scrollY > 30);
  updateHeader(); addEventListener('scroll', updateHeader, {passive:true});

  const menu = $('.menu-btn'), nav = $('#site-nav');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('open', !open);
    document.body.classList.toggle('menu-open', !open);
  });
  $$('#site-nav a').forEach(a => a.addEventListener('click', () => {
    menu?.setAttribute('aria-expanded','false'); nav?.classList.remove('open'); document.body.classList.remove('menu-open');
  }));

  const reveal = () => {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }), {threshold:.12, rootMargin:'0px 0px -6%'});
    $$('.reveal').forEach(el => io.observe(el));
  };

  const grid = $('#signature-grid');
  const filters = $('#filters');
  const collectionGrid = $('#collection-grid');
  const featured = config.works.filter(w => w.featured);
  const collections = ['All', ...new Set(config.works.map(w => w.collection))];
  let active = 'All';

  function renderWorks() {
    if (!grid) return;
    const works = featured.filter(w => active === 'All' || w.collection === active);
    grid.innerHTML = works.map((w,i) => `
      <a class="work-card reveal ${i % 5 === 0 ? 'wide' : ''}" href="artwork.html?id=${encodeURIComponent(w.id)}" aria-label="View ${escapeHtml(w.title)}">
        <figure><img src="${escapeHtml(w.file)}" alt="${escapeHtml(w.title)} — ${escapeHtml(w.location)}" loading="lazy" style="object-position:${escapeHtml(w.position)}"></figure>
        <div class="work-meta"><span>Signature Work ${String(config.works.indexOf(w)+1).padStart(2,'0')}</span><h3>${escapeHtml(w.title)}</h3><p>${escapeHtml(w.location)}</p></div>
      </a>`).join('');
    reveal();
  }
  function renderFilters() {
    if (!filters) return;
    filters.innerHTML = collections.filter(c => c === 'All' || featured.some(w => w.collection === c)).map(c => `<button class="filter ${c===active?'active':''}" data-filter="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('');
    $$('.filter', filters).forEach(b => b.addEventListener('click', () => {active=b.dataset.filter; renderFilters(); renderWorks();}));
  }
  function renderCollections() {
    if (!collectionGrid) return;
    const data = [
      ['Yosemite','the-last-light','Granite, weather, and sky'],
      ['Coast','coastal-noir','Fog, surf, and sea cliffs'],
      ['Forest','between-giants','Redwoods and fleeting light'],
      ['Wildlife','crossing-the-silence','Unscripted crossings'],
      ['Urban','framed-city','Fog, geometry, and motion'],
      ['Night','cathedral-of-stars','Stars, moonlight, and quiet']
    ];
    collectionGrid.innerHTML = data.map(([name,workId,desc]) => {
      const cover = config.works.find(w => w.id === workId);
      if (!cover) return '';
      return `<a class="collection-card reveal" href="#signature" data-collection="${escapeHtml(name)}"><img src="${escapeHtml(cover.file)}" alt="${escapeHtml(name)} collection" loading="lazy" style="object-position:${escapeHtml(cover.position)}"><span><b>${name==='Coast'?'California Coast':escapeHtml(name)}</b><small>${escapeHtml(desc)}</small></span></a>`;
    }).join('');
    $$('[data-collection]', collectionGrid).forEach(card => card.addEventListener('click', () => {active=card.dataset.collection; renderFilters(); renderWorks();}));
  }

  const artworkRoot = $('#artwork-root');
  if (artworkRoot) {
    const id = new URLSearchParams(location.search).get('id');
    const w = config.works.find(x => x.id === id) || config.works[0];
    document.title = `${w.title} | RizzVisuals`;
    artworkRoot.innerHTML = `
      <article class="artwork-detail">
        <section class="artwork-hero"><img src="${escapeHtml(w.file)}" alt="${escapeHtml(w.title)} — ${escapeHtml(w.location)}"><div class="artwork-counter">Signature Work ${String(config.works.indexOf(w)+1).padStart(2,'0')}</div></section>
        <section class="artwork-story section-pad">
          <div class="artwork-title reveal"><p class="eyebrow">${escapeHtml(w.collection)} Collection</p><h1>${escapeHtml(w.title)}</h1><p class="location">${escapeHtml(w.location)}</p></div>
          <div class="story-copy reveal"><p>${escapeHtml(w.story)}</p><dl><div><dt>Recommended finish</dt><dd>${escapeHtml(w.medium)}</dd></div><div><dt>Presentation</dt><dd>${escapeHtml(w.sizes)}</dd></div></dl><a class="button dark" href="${config.shopUrl}" target="_blank" rel="noopener">View print options ↗</a></div>
        </section>
        <nav class="artwork-nav" aria-label="Other signature works">
          ${(() => { const i=config.works.indexOf(w), prev=config.works[(i-1+config.works.length)%config.works.length], next=config.works[(i+1)%config.works.length]; return `<a href="artwork.html?id=${prev.id}"><span>Previous</span><b>${escapeHtml(prev.title)}</b></a><a href="artwork.html?id=${next.id}"><span>Next</span><b>${escapeHtml(next.title)}</b></a>`; })()}
        </nav>
      </article>`;
  } else {
    renderFilters(); renderWorks(); renderCollections();
  }
  reveal();
})();
