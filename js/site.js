/* Eletec preview — small vanilla script: contact settings, menu, enquiry form. No scroll listeners. */
(() => {
  const cfg = window.ELETEC || {};
  
  /* ---- Contact settings from config.js ---- */
  const wa = (cfg.whatsapp || '').replace(/\D/g, '');
  document.querySelectorAll('[data-wa]').forEach(el => {
    if (wa) {
      el.removeAttribute('data-placeholder');
      el.href = `https://wa.me/${wa}?text=${encodeURIComponent(cfg.whatsappMessage || 'Hello Eletec, I would like to ask about a lift.')}`;
      const s = el.querySelector('small'); if (s) s.remove();
    } else {
      el.setAttribute('data-placeholder', '');
      el.href = 'contact.html#whatsapp';
    }
  });
  document.querySelectorAll('[data-email]').forEach(el => {
    if (cfg.email) { el.textContent = cfg.email; el.href = `mailto:${cfg.email}`; }
  });

  /* ---- English / 中文 ---- */
  const html = document.documentElement;
  const metaDesc = document.querySelector('meta[name=description]');
  const ATTRS = ['alt', 'aria-label', 'placeholder', 'title'];
  const store = el => { for (const a of ATTRS) if (el.hasAttribute('data-zh-' + a) && !el.hasAttribute('data-en-' + a)) el.setAttribute('data-en-' + a, el.getAttribute(a)); };
  const setLang = zh => {
    html.lang = zh ? 'zh-Hans' : 'en-SG';
    document.querySelectorAll('[data-zh-alt],[data-zh-aria-label],[data-zh-placeholder],[data-zh-title]').forEach(el => {
      store(el);
      for (const a of ATTRS) if (el.hasAttribute('data-zh-' + a)) el.setAttribute(a, el.getAttribute((zh ? 'data-zh-' : 'data-en-') + a));
    });
    document.querySelectorAll('option[data-zh]').forEach(o => { if (!o.dataset.en) o.dataset.en = o.textContent; o.textContent = zh ? o.dataset.zh : o.dataset.en; });
    const zt = document.querySelector('meta[name=x-zh-title]')?.content, zd = document.querySelector('meta[name=x-zh-description]')?.content;
    document.title = zh ? zt : TITLE_EN;
    if (metaDesc) metaDesc.content = zh ? zd : DESC_EN;
    document.querySelectorAll('[data-lang-toggle]').forEach(b => b.setAttribute('aria-pressed', String(zh)));
    try { localStorage.setItem('eletec-lang', zh ? 'zh' : 'en'); } catch (e) {}
  };
  const TITLE_EN = document.querySelector('title').getAttribute('data-en') || document.querySelector('title').textContent;
  const DESC_EN = metaDesc?.content;
  if (html.lang === 'zh-Hans') setLang(true);
  document.querySelectorAll('[data-lang-toggle]').forEach(b => b.addEventListener('click', () => setLang(html.lang !== 'zh-Hans')));

  /* ---- Menu ---- */
  const menu = document.getElementById('menu');
  const openBtn = document.querySelector('[data-menu-open]');
  const closeBtn = document.querySelector('[data-menu-close]');
  const setMenu = open => {
    if (!menu) return;
    menu.dataset.open = String(open);
    menu.inert = !open;
    openBtn?.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    (open ? closeBtn : openBtn)?.focus();
  };
  if (menu) { menu.inert = true; }
  openBtn?.addEventListener('click', () => setMenu(true));
  closeBtn?.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu?.dataset.open === 'true') setMenu(false); });

  /* ---- Contact form: composes a WhatsApp message (or a call fallback) ---- */
  const form = document.querySelector('[data-enquiry]');
  if (form) {
    const note = form.querySelector('[data-form-note]');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(form);
      const name = (d.get('name') || '').toString().trim();
      const msg = (d.get('message') || '').toString().trim();
      const zh = document.documentElement.lang === 'zh-Hans';
      if (!name || !msg) { note.textContent = zh ? '请填写姓名和简短留言，再发送一次。' : 'Add your name and a short message, then send again.'; form.querySelector(name ? '#f-msg' : '#f-name').focus(); return; }
      const text = zh ? `您好 Eletec，我是${name}。咨询：${d.get('topic')}。${msg}${d.get('phone') ? ` 我的电话：${d.get('phone')}` : ''}` : `Hello Eletec, this is ${name}. Enquiry: ${d.get('topic')}. ${msg}${d.get('phone') ? ` My number: ${d.get('phone')}` : ''}`;
      if (wa) { location.href = `https://wa.me/${wa}?text=${encodeURIComponent(text)}`; }
      else { note.textContent = zh ? '我们的 WhatsApp 号码正在设置中。请致电 6746 2908，我们会在电话中为您处理咨询。' : 'Our WhatsApp number is being set up. Please call 6746 2908 and we will take your enquiry by phone.'; }
    });
  }
})();
