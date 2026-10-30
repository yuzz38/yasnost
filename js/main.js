/* Ясность — студия лазерной эпиляции. © 2026 Полунин Лев */
(function () {
  'use strict';
  var WA = 'https://api.whatsapp.com/send/?phone=79242640228&text=';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var rub = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };

  /* Появление заголовка */
  requestAnimationFrame(function () { requestAnimationFrame(function () { document.documentElement.classList.add('is-loaded'); }); });

  /* Шапка и кнопка WhatsApp */
  var header = $('.header'), hero = $('.hero'), fab = $('.fab'), ticking = false;
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    header.classList.toggle('is-solid', y > hero.offsetHeight - 80);
    fab.classList.toggle('is-on', y > window.innerHeight * 1.2);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* Бургер-меню */
  var burger = $('.burger'), nav = $('#nav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });

  /* Видео играет только в зоне видимости */
  var video = $('.path__video');
  if (video && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) { if (video.preload === 'none') video.preload = 'auto'; if (!reduce) { var pr = video.play(); if (pr && pr.catch) pr.catch(function () {}); } }
        else video.pause();
      });
    }, { threshold: 0.35 }).observe(video);
  }

  /* Ленивая карта */
  var map = $('#map iframe');
  if (map) {
    var loadMap = function () { if (!map.src) map.src = map.getAttribute('data-src'); };
    if ('IntersectionObserver' in window) {
      var mo = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { loadMap(); mo.disconnect(); } }, { rootMargin: '400px' });
      mo.observe(map);
    } else loadMap();
  }

  /* Вкладки прайса */
  var tabs = $$('.tabs__btn');
  function selectTab(t) {
    tabs.forEach(function (b) {
      var on = b === t;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on);
      b.tabIndex = on ? 0 : -1;
      $('#' + b.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      var n = tabs[(i + d + tabs.length) % tabs.length]; selectTab(n); n.focus();
    });
  });

  /* Калькулятор */
  var COMBOS = {
    c1: { name: 'Глубокое бикини + подмышечные впадины', price: 4000, cover: ['w-bikini-deep', 'w-bikini', 'w-armpits'] },
    c2: { name: 'Глубокое бикини + подмышечные впадины + голени', price: 6000, cover: ['w-bikini-deep', 'w-bikini', 'w-armpits', 'w-shins'] },
    c3: { name: 'Глубокое бикини + подмышечные впадины + ноги полностью', price: 7000, cover: ['w-bikini-deep', 'w-bikini', 'w-armpits', 'w-legs', 'w-shins', 'w-thighs', 'w-knees'] },
    c4: { name: 'Комплекс «Всё тело»', price: 9000, cover: ['w-bikini-deep', 'w-bikini', 'w-armpits', 'w-legs', 'w-shins', 'w-thighs', 'w-knees', 'w-arms', 'w-arms-low', 'w-arms-up', 'w-belly-line'] },
    c5: { name: 'Все зоны на лице и теле', price: 15000, cover: '*' }
  };
  var zones = $$('.zone__input'), picks = $$('.combo__pick'), combo = null;
  var elTotal = $('#sumTotal'), elList = $('#sumList'), elHint = $('#sumHint'), elAsk = $('#sumAsk');

  function covers(c, ids) {
    if (c.cover === '*') return ids.every(function (id) { return id.indexOf('w-') === 0; });
    return ids.every(function (id) { return c.cover.indexOf(id) > -1; });
  }
  function render() {
    var chosen = zones.filter(function (z) { return z.checked; });
    var ids = chosen.map(function (z) { return z.value; });
    var total = 0, names = [];
    if (combo) { total = COMBOS[combo].price; names = [COMBOS[combo].name]; }
    chosen.forEach(function (z) { total += +z.getAttribute('data-price'); names.push(z.getAttribute('data-name') + (z.getAttribute('data-panel') === 'm' ? ' (муж.)' : '')); });
    elTotal.textContent = rub(total);
    elList.textContent = names.length ? names.join(', ') : 'Пока ничего не выбрано. Отметьте зоны или комплекс.';
    picks.forEach(function (b) { var on = b.getAttribute('data-combo') === combo; b.closest('.combo').classList.toggle('is-picked', on); b.textContent = on ? 'Выбрано' : 'Выбрать'; b.setAttribute('aria-pressed', on); });

    // Подсказка: какой комплекс выгоднее
    elHint.hidden = true; elHint.innerHTML = '';
    if (!combo && ids.length > 1 && ids.every(function (id) { return id.indexOf('w-') === 0; })) {
      var best = null;
      Object.keys(COMBOS).forEach(function (k) { var c = COMBOS[k]; if (c.price < total && covers(c, ids) && (!best || c.price < COMBOS[best].price)) best = k; });
      if (best) {
        var p = document.createElement('p');
        p.textContent = '«' + COMBOS[best].name + '» — ' + rub(COMBOS[best].price) + ' ₽ за процедуру — включает все выбранные зоны, экономия ' + rub(total - COMBOS[best].price) + ' ₽.';
        var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Выбрать комплекс';
        b.addEventListener('click', function () { pickCombo(best); });
        elHint.appendChild(p); elHint.appendChild(b); elHint.hidden = false;
      }
    }
    var msg = names.length
      ? 'Здравствуйте! Подскажите, пожалуйста, по набору зон: ' + names.join(', ') + '. Стоимость процедуры по сайту: ' + rub(total) + ' ₽.'
      : 'Здравствуйте! Хочу задать вопрос по лазерной эпиляции.';
    elAsk.href = WA + encodeURIComponent(msg);
  }
  function pickCombo(k) {
    combo = combo === k ? null : k;
    if (combo) zones.forEach(function (z) { z.checked = false; });
    render();
  }
  zones.forEach(function (z) { z.addEventListener('change', function () { if (z.checked) combo = null; render(); }); });
  picks.forEach(function (b) { b.addEventListener('click', function () { pickCombo(b.getAttribute('data-combo')); }); });
  $('#sumReset').addEventListener('click', function () { combo = null; zones.forEach(function (z) { z.checked = false; }); render(); });
  render();

  /* Подарочный сертификат */
  var form = $('#giftForm'), customWrap = $('#customWrap'), custom = $('#customAmount'), customErr = $('#customErr');
  var cAmount = $('#certAmount'), cTo = $('#certTo'), cMsg = $('#certMsg');
  var giftTo = $('#giftTo'), giftFrom = $('#giftFrom'), giftMsg = $('#giftMsg');
  function amount() {
    var r = $('input[name="amount"]:checked', form).value;
    if (r !== 'custom') return +r;
    var v = parseInt(custom.value, 10);
    return isNaN(v) ? 0 : v;
  }
  function updateCert() {
    var isCustom = $('input[name="amount"]:checked', form).value === 'custom';
    customWrap.hidden = !isCustom;
    var a = amount();
    cAmount.textContent = a ? rub(a) + ' ₽' : '— ₽';
    cTo.textContent = giftTo.value.trim() ? 'Для: ' + giftTo.value.trim() : 'Для самого близкого человека';
    cMsg.textContent = giftMsg.value.trim() || 'Пусть в жизни будет больше ясных дней';
  }
  form.addEventListener('input', updateCert);
  form.addEventListener('change', function (e) {
    updateCert();
    if (e.target.name === 'amount' && e.target.value === 'custom') custom.focus();
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var a = amount();
    var isCustom = $('input[name="amount"]:checked', form).value === 'custom';
    if (isCustom && a < 1000) { customErr.hidden = false; custom.setAttribute('aria-invalid', 'true'); custom.focus(); return; }
    customErr.hidden = true; custom.removeAttribute('aria-invalid');
    var lines = [
      'Здравствуйте! Хочу оформить подарочный сертификат в «Ясность».',
      'Номинал: ' + rub(a) + ' ₽',
      'Формат: ' + $('input[name="format"]:checked', form).value
    ];
    if (giftTo.value.trim()) lines.push('Кому: ' + giftTo.value.trim());
    if (giftFrom.value.trim()) lines.push('От кого: ' + giftFrom.value.trim());
    lines.push('Пожелание: ' + (giftMsg.value.trim() || 'Пусть в жизни будет больше ясных дней'));
    window.open(WA + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });
  updateCert();

  /* Слайдер отзывов */
  var slider = $('#slider'), slides = $$('.review', slider), dotsBox = $('#sliderDots');
  var arrows = $$('.slider__arrow');
  slides.forEach(function () { dotsBox.appendChild(document.createElement('i')); });
  var dots = $$('i', dotsBox);
  function step() { return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : slider.clientWidth; }
  function sync() {
    var max = slider.scrollWidth - slider.clientWidth - 2;
    var idx = Math.round(slider.scrollLeft / step());
    if (slider.scrollLeft >= max) idx = slides.length - 1;
    dots.forEach(function (d, i) { d.classList.toggle('is-on', i === idx); });
    arrows[0].disabled = slider.scrollLeft <= 2;
    arrows[1].disabled = slider.scrollLeft >= max;
  }
  arrows.forEach(function (a) {
    a.addEventListener('click', function () { slider.scrollBy({ left: step() * +a.getAttribute('data-dir'), behavior: reduce ? 'auto' : 'smooth' }); });
  });
  slider.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); slider.scrollBy({ left: step() * (e.key === 'ArrowRight' ? 1 : -1), behavior: 'smooth' }); }
  });
  var st = false;
  slider.addEventListener('scroll', function () { if (!st) { st = true; requestAnimationFrame(function () { sync(); st = false; }); } }, { passive: true });
  window.addEventListener('resize', sync);
  sync();
})();
