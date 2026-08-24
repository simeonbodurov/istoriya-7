/* „Часът по история“ — малки удобства за четене.
   Няма зависимости. Всичко се пази локално в браузъра. */

(function () {
  "use strict";

  var LS = {
    font: "chas-font",
    last: "chas-last",
    read: "chas-read"
  };

  function get(k, d) {
    try { var v = localStorage.getItem(k); return v === null ? d : v; }
    catch (e) { return d; }
  }
  function set(k, v) {
    try { localStorage.setItem(k, v); } catch (e) {}
  }

  /* ---------- размер на шрифта ---------- */

  var STEPS = [0.94, 1.0, 1.075, 1.16, 1.26, 1.38];
  var idx = parseInt(get(LS.font, "2"), 10);
  if (isNaN(idx) || idx < 0 || idx >= STEPS.length) idx = 2;

  function applyFont() {
    document.documentElement.style.setProperty("--fs", STEPS[idx] + "rem");
    set(LS.font, String(idx));
  }
  applyFont();

  var minus = document.getElementById("fontMinus");
  var plus = document.getElementById("fontPlus");
  if (minus) minus.addEventListener("click", function () {
    if (idx > 0) { idx--; applyFont(); }
  });
  if (plus) plus.addEventListener("click", function () {
    if (idx < STEPS.length - 1) { idx++; applyFont(); }
  });

  /* ---------- лента с напредъка в главата ---------- */

  var bar = document.getElementById("progressBar");
  if (bar) {
    var tick = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
      bar.style.width = Math.min(100, Math.max(0, p * 100)).toFixed(1) + "%";
    };
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
    tick();
  }

  /* ---------- запомняне докъде сме стигнали ---------- */

  var reader = document.querySelector(".reader[data-page]");
  if (reader) {
    var page = reader.getAttribute("data-page");
    if (page) {
      set(LS.last, page);
      var marked = false;
      window.addEventListener("scroll", function () {
        if (marked) return;
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        if (max > 0 && (h.scrollTop / max) > 0.85) {
          marked = true;
          var read = get(LS.read, "");
          var arr = read ? read.split(",") : [];
          if (arr.indexOf(page) === -1) arr.push(page);
          set(LS.read, arr.join(","));
        }
      }, { passive: true });
    }
  }

  /* ---------- начална страница: „продължи“ и отметки ---------- */

  var resume = document.getElementById("resume");
  if (resume) {
    var last = get(LS.last, "");
    if (last) {
      var link = document.querySelector('a[href="' + last + '"]');
      if (link) {
        resume.innerHTML = "Продължи от <a href=\"" + last + "\">"
          + link.querySelector(".toc-title").textContent + "</a>";
        resume.hidden = false;
      }
    }
    get(LS.read, "").split(",").filter(Boolean).forEach(function (r) {
      var a = document.querySelector('a[href="' + r + '"]');
      if (a) a.classList.add("is-read");
    });
  }

  /* ---------- прелистване със стрелки на клавиатурата ---------- */

  document.addEventListener("keydown", function (e) {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    var sel = null;
    if (e.key === "ArrowRight") sel = ".pager a[href^='glava']:last-of-type";
    if (e.key === "ArrowLeft") sel = ".pager a[href^='glava']:first-of-type";
    if (!sel) return;
    var a = document.querySelector(sel);
    if (a) window.location.href = a.getAttribute("href");
  });
})();
