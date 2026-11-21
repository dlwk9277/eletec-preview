/* Eletec preview — small vanilla script: contact settings, menu, enquiry form. No scroll listeners. */
(() => {
  const cfg = window.ELETEC || {};
  
  /* ---- Contact settings from config.js ----
     WhatsApp buttons, rows and forms ship hidden. They only appear once config.js has a number. */
  const wa = (cfg.whatsapp || '').replace(/\D/g, '');
  const waLink = text => `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
  if (wa) {
    document.querySelectorAll('[data-wa]').forEach(el => { el.href = waLink(cfg.whatsappMessage || 'Hello Eletec, I would like to ask about a lift.'); el.hidden = false; });
    document.querySelectorAll('[data-wa-text]').forEach(el => { el.href = waLink(cfg.whatsappMessage || ''); el.textContent = '+' + wa; });
    document.querySelectorAll('[data-needs-wa]').forEach(el => { el.hidden = false; });
  }
  if (cfg.email) {
    document.querySelectorAll('[data-email]').forEach(el => { el.textContent = cfg.email; el.href = `mailto:${cfg.email}`; });
    document.querySelectorAll('[data-needs-email]').forEach(el => { el.hidden = false; });
  }

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

  /* ---- Forms: compose a WhatsApp message from the answers ---- */
  const isZh = () => document.documentElement.lang === 'zh-Hans';
  const shown = el => el.tagName === 'SELECT' ? el.options[el.selectedIndex].textContent.trim() : el.value.trim();
  const missing = form => [...form.querySelectorAll('[required]')].find(el => !el.value.trim());

  const fit = document.querySelector('[data-fit]');
  if (fit && wa) {
    const note = fit.querySelector('[data-form-note]');
    fit.addEventListener('submit', e => {
      e.preventDefault();
      const gap = missing(fit);
      if (gap) { note.textContent = isZh() ? '请填写所有必填项，再发送一次。' : 'Please answer every question, then send again.'; gap.focus(); return; }
      const v = id => shown(fit.querySelector('#' + id));
      const space = v('fit-space') || (isZh() ? '不确定' : 'not sure');
      const text = isZh()
        ? `您好 Eletec，我想了解我家能否安装电梯。\n房屋类型：${v('fit-house')}\n楼层数：${v('fit-floors')}\n大约可用空间：${space}\n时间安排：${v('fit-when')}\n姓名：${v('fit-name')}\n电话：${v('fit-phone')}`
        : `Hello Eletec, will a lift fit my house?\nHouse type: ${v('fit-house')}\nNumber of floors: ${v('fit-floors')}\nRough space available: ${space}\nTimeline: ${v('fit-when')}\nName: ${v('fit-name')}\nPhone: ${v('fit-phone')}`;
      location.href = waLink(text);
    });
  }

  const form = document.querySelector('[data-enquiry]');
  if (form && wa) {
    const note = form.querySelector('[data-form-note]');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const gap = missing(form);
      if (gap) { note.textContent = isZh() ? '请填写姓名和简短留言，再发送一次。' : 'Add your name and a short message, then send again.'; gap.focus(); return; }
      const v = id => shown(form.querySelector('#' + id));
      const phone = v('f-phone');
      const text = isZh()
        ? `您好 Eletec，我是${v('f-name')}。咨询内容：${v('f-topic')}。${v('f-msg')}${phone ? `\n我的电话：${phone}` : ''}`
        : `Hello Eletec, this is ${v('f-name')}. Topic: ${v('f-topic')}. ${v('f-msg')}${phone ? `\nMy number: ${phone}` : ''}`;
      location.href = waLink(text);
    });
  }
})();
