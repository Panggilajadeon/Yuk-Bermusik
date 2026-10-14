(() => {
  'use strict';

  // ---------- Piano mini (Web Audio) ----------
  const notes = [
    { n: 'Do', f: 261.63, k: 'a' }, { n: 'Re', f: 293.66, k: 's' },
    { n: 'Mi', f: 329.63, k: 'd' }, { n: 'Fa', f: 349.23, k: 'f' },
    { n: 'Sol', f: 392.0, k: 'g' }, { n: 'La', f: 440.0, k: 'h' },
    { n: 'Si', f: 493.88, k: 'j' }, { n: 'Do', f: 523.25, k: 'k' }
  ];
  const piano = document.getElementById('piano');
  const now = document.getElementById('now');
  let ctx;

  function play(i) {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = notes[i].f;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
    o.connect(g).connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 1.2);
    now.textContent = 'Nada: ' + notes[i].n;
    const el = piano.children[i];
    el.classList.add('on');
    setTimeout(() => el.classList.remove('on'), 160);
  }

  notes.forEach((note, i) => {
    const b = document.createElement('button');
    b.className = 'key';
    b.textContent = note.n;
    b.setAttribute('aria-label', 'Nada ' + note.n);
    b.addEventListener('pointerdown', () => play(i));
    piano.appendChild(b);
  });
  document.addEventListener('keydown', e => {
    if (e.repeat || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    const i = notes.findIndex(n => n.k === e.key.toLowerCase());
    if (i > -1) play(i);
  });

  // ---------- Navigasi ----------
  const nav = document.getElementById('nav');
  const menu = document.getElementById('menu');
  const burger = document.getElementById('burger');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10));
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', e => {
    if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); }
  });

  // ---------- Hitung angka statistik ----------
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const counters = document.querySelectorAll('[data-count]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count;
      io.unobserve(el);
      if (reduce) { el.textContent = end.toLocaleString('id-ID') + '+'; return; }
      const t0 = performance.now();
      (function tick(t) {
        const p = Math.min((t - t0) / 1200, 1);
        el.textContent = Math.round(end * p).toLocaleString('id-ID') + (p === 1 ? '+' : '');
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => io.observe(c));

  // ---------- Tab paket ----------
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on);
      document.getElementById(t.dataset.target).hidden = !on;
    });
  }));

  // ---------- Pilih paket -> isi form ----------
  const select = document.getElementById('paket-select');
  document.querySelectorAll('[data-pick]').forEach(a =>
    a.addEventListener('click', () => { select.value = a.dataset.pick; }));

  // ---------- Form -> WhatsApp ----------
  const WA_NUMBER = '6281234567890'; // ganti dengan nomor WhatsApp perusahaan
  const form = document.getElementById('form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    const show = (input, msg) => {
      input.classList.toggle('invalid', !!msg);
      input.parentElement.querySelector('.err').textContent = msg || '';
      if (msg) ok = false;
    };
    const nama = form.nama, wa = form.wa;
    show(nama, nama.value.trim().length < 2 ? 'Isi nama dengan benar.' : '');
    show(wa, /^(\+62|62|0)8\d{7,12}$/.test(wa.value.replace(/[\s-]/g, '')) ? '' : 'Isi nomor WhatsApp yang valid, contoh 08123456789.');
    if (!ok) return;
    const text = `Halo Nada Ceria, saya ${nama.value.trim()} ingin coba kelas gratis.\nPaket: ${form.paket.value}\nAlat musik: ${form.alat.value}\nNo. WA: ${wa.value}`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();