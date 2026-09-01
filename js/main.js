/* =========================================================================
   Arsalane Soutien — site public : interactions (JavaScript vanilla)
   Amélioration progressive : le site fonctionne entièrement sans JavaScript.
   ========================================================================= */
(function () {
  "use strict";

  var CFG = window.ARSALANE_CONFIG || {};

  /* ---- Liens pilotés par la configuration -------------------------- */
  function each(sel, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), fn);
  }

  each("[data-admin-link]", function (a) {
    if (!CFG.ADMIN_URL) return;
    a.href = CFG.ADMIN_URL;
    a.target = "_blank";
    a.rel = "noopener";
  });

  each("[data-phone]", function (a) {
    var n = a.getAttribute("data-phone") === "2" ? "2" : "1";
    var tel = CFG["PHONE_" + n + "_TEL"] || "";
    var disp = CFG["PHONE_" + n + "_DISPLAY"] || "";
    a.href = "tel:" + tel;
    if (a.hasAttribute("data-phone-text") && disp) a.textContent = disp;
  });

  each("[data-social]", function (a) {
    var url = a.getAttribute("data-social") === "facebook" ? CFG.FACEBOOK_URL : CFG.INSTAGRAM_URL;
    if (!url) return;
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
  });

  each("[data-maps]", function (a) {
    if (!CFG.MAPS_URL) return;
    a.href = CFG.MAPS_URL;
  });

  /* ---- Année du pied de page -------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- En-tête : état au défilement ------------------------------ */
  var header = document.querySelector(".masthead");
  var onScroll = function () {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 4);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Menu mobile --------------------------------------------- */
  var toggle = document.querySelector(".burger");
  var nav = document.getElementById("menu");
  function closeMenu() {
    if (!nav) return;
    nav.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 899) closeMenu();
    });
  }

  /* ---- Navigation active selon la section visible ------------- */
  var navLinks = Array.prototype.filter.call(
    document.querySelectorAll(".mainnav > a"),
    function (a) {
      var h = a.getAttribute("href") || "";
      return h.charAt(0) === "#" && h.length > 1;
    }
  );
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Formulaire de contact --------------------------------- */
  var form = document.getElementById("contact-form");
  var statusEl = document.getElementById("cf-status");
  var PHONE_DISPLAY = CFG.PHONE_1_DISPLAY || "";
  var PHONE_TEL = CFG.PHONE_1_TEL || "";

  function setStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = "cform__status" + (kind ? " is-" + kind : "");
  }

  if (form) {
    if (!CFG.CONTACT_API_URL) {
      form.innerHTML =
        '<p class="mono note">Le message en ligne n\'est pas encore activé — ' +
        'appelez le centre :</p>' +
        '<a class="btn" href="tel:' + PHONE_TEL + '">' +
        (PHONE_DISPLAY || "Appeler le centre") + "</a>";
      return;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.dataset.sending === "1") return;

      if (form.website && form.website.value) {
        setStatus("Merci, votre message a bien été envoyé.", "ok");
        form.reset();
        return;
      }

      var data = {
        full_name: form.full_name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        message: form.message.value.trim(),
        subject: "Message depuis le site",
        source: "site_statique",
      };

      if (!data.full_name || !data.message) {
        setStatus("Merci d'indiquer votre nom et votre message.", "error");
        return;
      }
      if (!data.phone && !data.email) {
        setStatus("Indiquez un téléphone ou un e-mail pour être recontacté.", "error");
        return;
      }

      form.dataset.sending = "1";
      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Envoi…"; }
      setStatus("Envoi en cours…", "");

      fetch(CFG.CONTACT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (body) {
            return { ok: r.ok, status: r.status, body: body };
          });
        })
        .then(function (res) {
          if (res.ok) {
            setStatus("Merci, votre message a bien été envoyé. Le centre vous recontactera.", "ok");
            form.reset();
          } else if (res.status === 429) {
            setStatus("Vous avez déjà envoyé plusieurs messages. Merci de réessayer plus tard.", "error");
          } else {
            setStatus(
              (res.body && res.body.error) ||
              "L'envoi a échoué. Vous pouvez nous appeler au " + PHONE_DISPLAY + ".",
              "error"
            );
          }
        })
        .catch(function () {
          setStatus(
            "Impossible d'envoyer le message pour le moment. Appelez-nous au " + PHONE_DISPLAY + ".",
            "error"
          );
        })
        .finally(function () {
          form.dataset.sending = "0";
          if (btn) { btn.disabled = false; btn.textContent = label; }
        });
    });
  }
})();
