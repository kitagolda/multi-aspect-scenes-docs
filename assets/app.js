(function () {
  // 1. Theme toggle
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    var next = cur === "dark" ? "light" : "dark";
    if (next === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    try { localStorage.setItem("wbip-docs-theme", next); } catch (e) {}
  }
  var t1 = document.getElementById("theme-toggle");
  var t2 = document.getElementById("mobile-theme-toggle");
  if (t1) t1.addEventListener("click", toggleTheme);
  if (t2) t2.addEventListener("click", toggleTheme);

  // 2. Mobile sidebar
  var sb = document.getElementById("sidebar");
  var bd = document.getElementById("sidebar-backdrop");
  var openBtn = document.getElementById("sidebar-open");
  var closeBtn = document.getElementById("sidebar-close");
  function setMenu(open) {
    if (!sb || !bd) return;
    sb.classList.toggle("open", open);
    bd.classList.toggle("open", open);
  }
  if (openBtn) openBtn.addEventListener("click", function () { setMenu(true); });
  if (closeBtn) closeBtn.addEventListener("click", function () { setMenu(false); });
  if (bd) bd.addEventListener("click", function () { setMenu(false); });

  // 3. Copy buttons on code blocks
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pre = btn.closest(".code-block") && btn.closest(".code-block").querySelector("pre");
      if (!pre) return;
      var text = pre.innerText;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = "Copied!";
          setTimeout(function () { btn.textContent = "Copy"; }, 1400);
        });
      }
    });
  });

  // 4. Per-table live search + scope chip filter
  document.querySelectorAll("[data-table-toolbar]").forEach(function (bar) {
    var tableId = bar.getAttribute("data-table-toolbar");
    var table = document.getElementById(tableId);
    if (!table) return;
    var rows = Array.prototype.slice.call(table.querySelectorAll("tbody tr"));
    var input = bar.querySelector(".table-search");
    var chips = Array.prototype.slice.call(bar.querySelectorAll(".chip"));
    var countEl = bar.querySelector("[data-count]");
    var activeScope = "all";

    function applyFilter() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      rows.forEach(function (tr) {
        var sc = tr.getAttribute("data-scope") || "";
        var hay = tr.getAttribute("data-search") || "";
        var okScope = activeScope === "all" || sc === activeScope;
        var okQuery = !q || hay.indexOf(q) !== -1;
        var show = okScope && okQuery;
        tr.style.display = show ? "" : "none";
        if (show) visible++;
      });
      if (countEl) {
        countEl.innerHTML = "Showing <strong>" + visible + "</strong> of " + rows.length;
      }
    }

    if (input) input.addEventListener("input", applyFilter);
    chips.forEach(function (ch) {
      ch.addEventListener("click", function () {
        activeScope = ch.getAttribute("data-scope") || "all";
        chips.forEach(function (c) { c.classList.toggle("active", c === ch); });
        applyFilter();
      });
    });

    // Apply ?q=... deep link from global search if present
    var params = new URLSearchParams(window.location.search);
    var initQ = params.get("q");
    if (initQ && input) {
      input.value = initQ;
      applyFilter();
      table.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  // 5. Global search across all 508 scenes
  var gsInput = document.getElementById("global-search-input");
  var gsRes = document.getElementById("global-search-results");
  var index = window.SCENE_SEARCH_INDEX || [];

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  if (gsInput && gsRes) {
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        gsInput.focus();
      } else if (e.key === "Escape" && document.activeElement === gsInput) {
        gsRes.hidden = true;
        gsInput.blur();
      }
    });

    gsInput.addEventListener("input", function () {
      var q = gsInput.value.trim().toLowerCase();
      if (!q) { gsRes.hidden = true; gsRes.innerHTML = ""; return; }
      var matches = [];
      for (var i = 0; i < index.length; i++) {
        var it = index[i];
        if ((it.pkg + " " + it.scene + " " + it.groupShort).toLowerCase().indexOf(q) !== -1) {
          matches.push(it);
          if (matches.length >= 25) break;
        }
      }
      if (matches.length === 0) {
        gsRes.innerHTML = '<div class="gsr-empty">No matching scenes found.</div>';
      } else {
        gsRes.innerHTML = matches.map(function (m) {
          var href = "./" + m.page + "?q=" + encodeURIComponent(m.pkg);
          return '<a class="gsr-item" href="' + href + '">' +
            '<div class="gsr-pkg">' + escapeHtml(m.pkg) + '</div>' +
            '<div class="gsr-meta"><span>' + escapeHtml(m.scene) + '</span><span class="badge badge-' + escapeHtml(m.badge) + '">' + escapeHtml(m.groupNum) + ' · ' + escapeHtml(m.groupShort) + '</span></div>' +
          '</a>';
        }).join("");
      }
      gsRes.hidden = false;
    });

    document.addEventListener("click", function (e) {
      if (!gsInput.contains(e.target) && !gsRes.contains(e.target)) {
        gsRes.hidden = true;
      }
    });
  }

  // 6. Distribution block chart tabs & cross-highlight
  var distCard = document.getElementById("dist-card");
  if (distCard) {
    var chartTabs = Array.prototype.slice.call(distCard.querySelectorAll("[data-chart-tab]"));
    var chartPanels = Array.prototype.slice.call(distCard.querySelectorAll("[data-chart-panel]"));
    chartTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var mode = tab.getAttribute("data-chart-tab");
        chartTabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle("active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
        });
        chartPanels.forEach(function (p) {
          p.classList.toggle("active", p.getAttribute("data-chart-panel") === mode);
        });
      });
    });

    var groupEls = Array.prototype.slice.call(distCard.querySelectorAll("[data-group]"));
    function setHover(grp) {
      distCard.classList.toggle("has-hover", !!grp);
      groupEls.forEach(function (el) {
        el.classList.toggle("is-hovered", grp && el.getAttribute("data-group") === grp);
      });
    }
    groupEls.forEach(function (el) {
      el.addEventListener("mouseenter", function () { setHover(el.getAttribute("data-group")); });
      el.addEventListener("mouseleave", function () { setHover(null); });
      el.addEventListener("focus", function () { setHover(el.getAttribute("data-group")); });
      el.addEventListener("blur", function () { setHover(null); });
    });
  }
})();
