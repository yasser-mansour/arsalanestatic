/* =========================================================================
   Arsalane Soutien — site public : interactions (JavaScript vanilla)
   Amélioration progressive : le site fonctionne entièrement sans JavaScript,
   ceci ne fait que fluidifier l'usage.
   ========================================================================= */
(function () {
  "use strict";

  var CFG = window.ARSALANE_CONFIG || {};

  /* ---- Liens pilotés par la configuration ---------------------------- */
  document.querySelectorAll("[data-admin-link]").forEach(function (a) {
    if (CFG.ADMIN_URL) {
      a.href = CFG.ADMIN_URL;
      a.target = "_blank";
      a.rel = "noopener";
    }
  });
  document.querySelectorAll("[data-phone-link]").forEach(function (a) {
    a.href = "tel:" + (CFG.PHONE_TEL || "");
    if (a.hasAttribute("data-phone-text") && CFG.PHONE_DISPLAY) {
      a.textContent = CFG.PHONE_DISPLAY;
    }
  });

  /* ---- Année du pied de page --------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- En-tête : ombre au défilement ------------------------------ */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Menu mobile ---------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
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
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 940) closeMenu();
    });
  }

  /* ---- Apparition au défilement -------------------------------- */
  var revealables = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---- Navigation active selon la section visible ------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav a"));
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

  function setStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = "contact-form__status" + (kind ? " is-" + kind : "");
  }

  if (form) {
    if (!CFG.CONTACT_API_URL) {
      // Endpoint non configuré : on remplace le formulaire par un appel à l'action.
      form.innerHTML =
        '<p>Le formulaire en ligne n\'est pas encore activé. ' +
        'Contactez le centre par téléphone :</p>' +
        '<a class="btn btn--primary btn--block" data-phone-link href="tel:' +
        (CFG.PHONE_TEL || "") + '">' + (CFG.PHONE_DISPLAY || "Appeler le centre") + "</a>";
      return;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.dataset.sending === "1") return;

      // Pot de miel : si rempli, on simule un succès sans rien envoyer.
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
              "L'envoi a échoué. Vous pouvez nous appeler au " + (CFG.PHONE_DISPLAY || "") + ".",
              "error"
            );
          }
        })
        .catch(function () {
          setStatus(
            "Impossible d'envoyer le message pour le moment. Appelez-nous au " +
            (CFG.PHONE_DISPLAY || "") + ".",
            "error"
          );
        })
        .finally(function () {
          form.dataset.sending = "0";
          if (btn) { btn.disabled = false; btn.textContent = label; }
        });
    });
  }

  // Ré-applique la config sur les liens injectés dynamiquement (fallback formulaire).
  document.querySelectorAll("[data-phone-link]").forEach(function (a) {
    a.href = "tel:" + (CFG.PHONE_TEL || "");
  });
})();
