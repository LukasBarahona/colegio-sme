/* Colegio Santa Margarita de Escocia — interacciones del sitio */
(function () {
  "use strict";

  var root = document.documentElement;
  var header = document.getElementById("site-header");
  var headerMain = header.querySelector(".header-main");
  var announcement = document.getElementById("announcement");
  var closeAnnouncement = document.getElementById("announcement-close");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =======================================================
     Encabezado fijo
     ======================================================= */
  // Alto del encabezado sin achicar (--hdr-h en diseno.css) + barra de admisión.
  // Se usa para dejar espacio arriba en la portada y en los encabezados de página.
  function cssPx(name, fallback) {
    var v = parseFloat(getComputedStyle(root).getPropertyValue(name));
    return isNaN(v) ? fallback : v;
  }
  function syncHeaderHeight() {
    var main = cssPx("--hdr-h", headerMain.offsetHeight);
    var aviso = announcement && !announcement.hidden ? cssPx("--aviso-h", announcement.offsetHeight) : 0;
    root.style.setProperty("--header-h", (main + aviso) + "px");
  }

  // Al bajar, el encabezado se achica y se vuelve más sólido después de la portada
  var cover = document.querySelector(".hero, .page-header");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle("is-scrolled", y > 24);
    var limit = cover ? cover.offsetHeight - header.offsetHeight : 0;
    header.classList.toggle("is-solid", y > Math.max(limit, 24));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Barra de admisión: se puede cerrar y queda cerrada durante la sesión
  if (announcement) {
    try {
      if (sessionStorage.getItem("sme-aviso-cerrado") === "1") announcement.hidden = true;
    } catch (e) { /* almacenamiento no disponible */ }

    closeAnnouncement.addEventListener("click", function () {
      announcement.hidden = true;
      try { sessionStorage.setItem("sme-aviso-cerrado", "1"); } catch (e) {}
      syncHeaderHeight();
    });
  }

  syncHeaderHeight();
  window.addEventListener("resize", syncHeaderHeight);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeaderHeight);

  /* =======================================================
     Paneles: Conócenos, Accesos, Buscar y menú móvil
     ======================================================= */
  var panels = [
    { id: "conocenos", btn: "conocenos-btn", panel: "conocenos-panel" },
    { id: "accesos", btn: "accesos-btn", panel: "accesos-panel", focus: "a" },
    { id: "buscar", btn: "buscar-btn", panel: "buscar-panel", focus: "input" },
    { id: "menu", btn: "menu-btn", panel: "mobile-menu", focus: "input", lock: true }
  ].map(function (p) {
    return { id: p.id, btn: document.getElementById(p.btn), panel: document.getElementById(p.panel), focus: p.focus, lock: p.lock };
  }).filter(function (p) { return p.btn && p.panel; });

  function find(id) {
    for (var i = 0; i < panels.length; i++) if (panels[i].id === id) return panels[i];
    return null;
  }

  function setOpen(item, open) {
    item.panel.hidden = !open;
    item.btn.setAttribute("aria-expanded", String(open));
    if (item.lock) {
      document.body.classList.toggle("is-locked", open);
      item.btn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    }
  }

  function closeAll(except) {
    panels.forEach(function (item) {
      if (item !== except && !item.panel.hidden) setOpen(item, false);
    });
  }

  panels.forEach(function (item) {
    item.btn.addEventListener("click", function (ev) {
      ev.stopPropagation();
      var willOpen = item.panel.hidden;
      closeAll(item);
      setOpen(item, willOpen);
      if (willOpen && item.focus) {
        var first = item.panel.querySelector(item.focus);
        if (first) first.focus({ preventScroll: true });
      }
    });
    item.panel.addEventListener("click", function (ev) { ev.stopPropagation(); });
  });

  // El activador dentro del panel de Conócenos lo cierra (igual que en Figma)
  document.querySelectorAll('[data-close="conocenos"]').forEach(function (el) {
    el.addEventListener("click", function () {
      var item = find("conocenos");
      setOpen(item, false);
      item.btn.focus();
    });
  });

  // Clic fuera o tecla Escape → cerrar
  document.addEventListener("click", function () { closeAll(null); });
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape") return;
    panels.forEach(function (item) {
      if (!item.panel.hidden) { setOpen(item, false); item.btn.focus(); }
    });
  });

  // Al pasar a pantalla ancha, cerrar el menú móvil
  window.matchMedia("(min-width: 1360px)").addEventListener("change", function (mq) {
    var menu = find("menu");
    if (mq.matches && menu) setOpen(menu, false);
  });

  /* =======================================================
     Enlaces que todavía no tienen destino
     ======================================================= */
  document.querySelectorAll("[data-pendiente]").forEach(function (el) {
    el.addEventListener("click", function (ev) { ev.preventDefault(); });
    el.title = el.getAttribute("data-pendiente");
    el.setAttribute("aria-disabled", "true");
  });

  /* =======================================================
     Selector de nivel (Básica y Media)
     ======================================================= */
  document.querySelectorAll("[data-level-hub]").forEach(function (hub) {
    var tabs = Array.prototype.slice.call(hub.querySelectorAll('[role="tab"]'));

    function select(tab, moveFocus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (moveFocus) tab.focus();
      try { history.replaceState(null, "", "#" + tab.getAttribute("data-nivel")); } catch (e) {}
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (ev) {
        var next = null;
        if (ev.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (ev.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (ev.key === "Home") next = tabs[0];
        if (ev.key === "End") next = tabs[tabs.length - 1];
        if (next) { ev.preventDefault(); select(next, true); }
      });
    });

    // Abrir el nivel indicado en la dirección (#media, #electivos, #basica…)
    var hash = location.hash.replace("#", "");
    if (hash === "media" || hash === "electivos") select(hub.querySelector('[data-nivel="media"]'), false);
    if (hash === "electivos") {
      var target = document.getElementById("electivos");
      if (target) setTimeout(function () { target.scrollIntoView(); }, 0);
    }
  });

  /* =======================================================
     Filtros por año y categoría (Noticias y Documentos)
     ======================================================= */
  document.querySelectorAll("[data-filters]").forEach(function (box) {
    var name = box.getAttribute("data-filters");
    var list = document.querySelector('[data-filter-list="' + name + '"]');
    var empty = document.querySelector('[data-filter-empty="' + name + '"]');
    if (!list) return;
    var items = Array.prototype.slice.call(list.children);
    var selects = Array.prototype.slice.call(box.querySelectorAll("select[data-filter]"));

    // Las opciones salen de los datos de cada tarjeta (data-anio, data-categoria)
    selects.forEach(function (sel) {
      var key = sel.getAttribute("data-filter");
      var values = [];
      items.forEach(function (it) {
        var v = (it.getAttribute("data-" + key) || "").trim();
        if (v && values.indexOf(v) === -1) values.push(v);
      });
      values.sort(function (a, b) { return key === "anio" ? b.localeCompare(a) : a.localeCompare(b, "es"); });
      values.forEach(function (v) {
        var opt = document.createElement("option");
        opt.value = v; opt.textContent = v;
        sel.appendChild(opt);
      });
      if (!values.length) sel.title = "Aún no hay publicaciones con este dato";
    });

    function apply() {
      var shown = 0;
      items.forEach(function (it) {
        var ok = selects.every(function (sel) {
          return !sel.value || (it.getAttribute("data-" + sel.getAttribute("data-filter")) || "") === sel.value;
        });
        it.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    }
    selects.forEach(function (sel) { sel.addEventListener("change", apply); });
  });

  /* =======================================================
     Galería: las cuatro fotos giran en cascada y avanzan juntas
     (así nunca se repite una foto en pantalla)
     ======================================================= */
  document.querySelectorAll("[data-gallery]").forEach(function (gallery) {
    var tiles = Array.prototype.slice.call(gallery.querySelectorAll(".flip-tile"));
    if (tiles.length < 2 || reduceMotion) return;
    var slides = tiles.map(function (t) {
      var img = t.querySelector("img");
      return { src: img.getAttribute("src"), alt: img.getAttribute("alt"), label: t.querySelector("figcaption").textContent };
    });
    var state = tiles.map(function (t, i) { return i; });
    var timer = null;

    function round() {
      tiles.forEach(function (t, i) { setTimeout(function () { flip(i); }, i * 160); });
    }

    function flip(i) {
      var tile = tiles[i];
      state[i] = (state[i] + 1) % slides.length;
      var s = slides[state[i]];
      tile.classList.add("is-flipping");
      setTimeout(function () {
        var img = tile.querySelector("img");
        img.src = s.src; img.alt = s.alt;
        tile.querySelector("figcaption").textContent = s.label;
        tile.classList.remove("is-flipping");
      }, 450);
    }

    function start() {
      if (timer) return;
      timer = setInterval(round, 5000);
    }
    function stop() { clearInterval(timer); timer = null; }

    // Solo gira mientras la galería está a la vista y nadie la apunta con el mouse
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0.3 }).observe(gallery);
    } else { start(); }
    gallery.addEventListener("mouseenter", stop);
    gallery.addEventListener("mouseleave", start);
  });

  /* =======================================================
     Formulario de contacto
     Sin servidor todavía: valida los campos y abre el correo
     del usuario con el mensaje listo para enviar.
     ======================================================= */
  var form = document.getElementById("contact-form");
  if (form) {
    var status = document.getElementById("contact-status");
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function check(input) {
      var value = input.value.trim();
      var ok = input.type === "email" ? emailOk.test(value) : value.length > 0;
      var field = input.closest(".field");
      var error = document.getElementById(input.id + "-error");
      field.classList.toggle("is-invalid", !ok);
      field.classList.toggle("is-valid", ok);
      input.setAttribute("aria-invalid", String(!ok));
      if (error) {
        error.hidden = ok;
        if (!ok) input.setAttribute("aria-describedby", error.id); else input.removeAttribute("aria-describedby");
      }
      return ok;
    }

    var inputs = Array.prototype.slice.call(form.querySelectorAll("[required]"));
    inputs.forEach(function (input) {
      input.addEventListener("blur", function () { if (input.value.trim()) check(input); });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("is-invalid")) check(input);
      });
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var firstBad = null;
      inputs.forEach(function (input) { if (!check(input) && !firstBad) firstBad = input; });
      status.hidden = false;
      if (firstBad) {
        status.className = "form-card__status is-error";
        status.textContent = "Revisa los campos marcados en rojo.";
        firstBad.focus();
        return;
      }
      var data = new FormData(form);
      var subject = "Contacto web · " + data.get("motivo") + " · " + data.get("nombre");
      var body = data.get("mensaje") + "\n\n—\n" + data.get("nombre") + "\n" + data.get("correo");
      var to = form.getAttribute("data-destino");
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      status.className = "form-card__status";
      status.textContent = "Listo. Se abrió tu programa de correo con el mensaje para " + to + ". Solo falta presionar Enviar.";
    });
  }

  /* =======================================================
     Buscador del sitio (busqueda.html)
     ======================================================= */
  var searchList = document.querySelector("[data-search-list]");
  if (searchList && window.SME_INDICE) {
    var params = new URLSearchParams(location.search);
    var q = (params.get("q") || "").trim();
    var input = document.getElementById("q-pagina");
    var resultsBox = document.querySelector("[data-search-results]");
    var emptyBox = document.querySelector("[data-search-empty]");
    var count = document.querySelector("[data-search-count]");
    var title = document.querySelector("[data-search-title]");
    var lead = document.querySelector("[data-search-lead]");
    var heading = document.querySelector("[data-search-heading]");
    if (input) input.value = q;

    var norm = function (s) {
      return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    };
    var escapeHtml = function (s) {
      return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
    };

    if (q) {
      var terms = norm(q).split(/\s+/).filter(function (t) { return t.length > 1; });
      var results = [];
      window.SME_INDICE.forEach(function (page) {
        var hayTitle = norm(page.titulo);
        var hay = norm(page.titulo + " " + page.descripcion + " " + page.texto);
        var score = 0;
        var all = terms.every(function (t) {
          var n = hay.split(t).length - 1;
          if (!n) return false;
          score += n + (hayTitle.indexOf(t) > -1 ? 10 : 0);
          return true;
        });
        if (all && terms.length) results.push({ page: page, score: score });
      });
      results.sort(function (a, b) { return b.score - a.score; });

      if (results.length) {
        resultsBox.hidden = false;
        count.textContent = results.length === 1 ? "1 resultado para «" + q + "»." : results.length + " resultados para «" + q + "».";
        results.forEach(function (r) {
          var p = r.page;
          // Extracto alrededor de la primera coincidencia
          var plain = p.texto;
          var idx = norm(plain).indexOf(terms[0]);
          var from = Math.max(0, idx - 80);
          var excerpt = (from > 0 ? "…" : "") + plain.slice(from, from + 220) + (plain.length > from + 220 ? "…" : "");
          var safe = escapeHtml(excerpt);
          terms.forEach(function (t) {
            var re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
            safe = safe.replace(re, "<mark>$1</mark>");
          });
          var a = document.createElement("a");
          a.className = "result-card";
          a.href = p.url;
          a.innerHTML = '<span class="result-card__title">' + escapeHtml(p.titulo) + "</span>" +
            '<span class="result-card__text">' + safe + "</span>";
          searchList.appendChild(a);
        });
      } else {
        emptyBox.hidden = false;
        if (title) title.textContent = "Sin resultados";
        if (lead) lead.textContent = "No encontramos coincidencias para «" + q + "».";
        if (heading) heading.textContent = "Buscar nuevamente";
        document.title = "Sin resultados · Colegio Santa Margarita de Escocia";
      }
    } else if (input) {
      input.focus();
    }
  }

  /* =======================================================
     Año del pie de página
     ======================================================= */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* =======================================================
     Animaciones al aparecer en pantalla
     Cada elemento aparece una sola vez y luego queda quieto.
     La lista es la misma que en diseno.css.
     ======================================================= */
  var REVELAR = ".section__title, .section__lead, .section__note, .section__body, .eyebrow, .subsection__title, " +
    ".grid > *, .doc-list > *, .event-list > *, .steps > *, .soft-grid > *, .result-list > *, .gallery > *, " +
    ".contact-grid > *, .panel, .resource-block, .process__step, .data-table, .alert, .info-box, .mv__block, .mv__img, " +
    ".filters, .level-hub__intro, .cta, .collage-intro__side, .search-bar--wide, .btn--block, .article-img, .doc-card--single";

  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    var start = null, dur = 1400;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = "0";
    requestAnimationFrame(step);
  }

  if (root.classList.contains("js-motion")) {
    window.SME_MOTION = true;
    var items = Array.prototype.slice.call(document.querySelectorAll(REVELAR))
      .filter(function (el) { return !el.closest(".site-header, .page-header, .hero, .footer"); });

    // Retraso escalonado entre hermanos (máximo 6 pasos)
    items.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (s) { return items.indexOf(s) > -1; });
      el.style.setProperty("--i", Math.min(sibs.indexOf(el), 6));
    });

    var targets = items.concat(Array.prototype.slice.call(document.querySelectorAll("[data-collage]")));

    function show(el) {
      el.classList.add("is-visible");
      el.querySelectorAll("[data-count]").forEach(countUp);
    }

    // Lo que ya está a la vista al cargar aparece de inmediato (con su escalonado)
    var vh = window.innerHeight;
    targets = targets.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.width && r.top < vh * 0.94 && r.bottom > 0) { show(el); return false; }
      return true;
    });

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
      targets.forEach(function (el) { io.observe(el); });
    } else {
      targets.forEach(show);
    }
  }
})();
