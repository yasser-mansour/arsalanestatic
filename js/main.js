/* =========================================================================
   Arsalane Soutien — site public : interactions (JavaScript vanilla)
   Amélioration progressive : le site fonctionne entièrement sans JavaScript.
   ========================================================================= */
(function () {
  "use strict";

  var CFG = window.ARSALANE_CONFIG || {};
  function each(sel, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), fn);
  }

  /* ---- Liens pilotés par la configuration -------------------------- */
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
    if (CFG.MAPS_URL) a.href = CFG.MAPS_URL;
  });

  each("[data-dev-link]", function (a) {
    if (CFG.DEV_NAME) a.textContent = CFG.DEV_NAME;
    if (CFG.DEV_URL) {
      a.href = CFG.DEV_URL;
      a.target = "_blank";
      a.rel = "noopener";
    } else {
      // pas d'URL : rendre le crédit en texte simple
      var span = document.createElement("span");
      span.className = a.className;
      span.textContent = a.textContent;
      a.parentNode.replaceChild(span, a);
    }
  });

  /* ---- Année du pied de page -------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- En-tête : fond au défilement ------------------------------ */
  var site = document.querySelector(".site");
  var onScroll = function () {
    if (site) site.classList.toggle("is-stuck", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Menu mobile --------------------------------------------- */
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  function closeMenu() {
    if (!nav) return;
    nav.classList.remove("is-open");
    if (btn) btn.setAttribute("aria-expanded", "false");
  }
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* ---- Navigation active selon la section visible ------------- */
  var navLinks = Array.prototype.filter.call(
    document.querySelectorAll(".nav > a"),
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

  /* ---- Formulaire « Écrire au centre » ------------------------ */
  var form = document.getElementById("contact-form");
  var statusEl = document.getElementById("cf-status");
  var PHONE_DISPLAY = CFG.PHONE_1_DISPLAY || "";
  var PHONE_TEL = CFG.PHONE_1_TEL || "";

  function setStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = "wform__status" + (kind ? " is-" + kind : "");
  }

  if (form) {
    if (!CFG.CONTACT_API_URL) {
      form.innerHTML =
        '<p class="wform__label">Écrire au centre</p>' +
        '<p>Le message en ligne n\'est pas activé — appelez le centre :</p>' +
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
      var submitBtn = form.querySelector('button[type="submit"]');
      var label = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Envoi…"; }
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
          setStatus("Impossible d'envoyer le message pour le moment. Appelez-nous au " + PHONE_DISPLAY + ".", "error");
        })
        .finally(function () {
          form.dataset.sending = "0";
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = label; }
        });
    });
  }

  /* ---- Emploi du temps : visionneuse (lightbox) ---------------- */
  var scheduleButtons = Array.prototype.slice.call(document.querySelectorAll(".schedule-item"));
  var lightbox = document.getElementById("lightbox");

  if (scheduleButtons.length && lightbox) {
    var lightboxImg = document.getElementById("lightbox-img");
    var lightboxTitle = document.getElementById("lightbox-title");
    var closeBtn = document.getElementById("lightbox-close");
    var opener = null;

    function openLightbox(button) {
      opener = button;
      lightboxImg.src = button.dataset.image;
      lightboxImg.alt = button.dataset.title;
      lightboxTitle.textContent = button.dataset.title;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (opener) opener.focus();
    }

    scheduleButtons.forEach(function (button) {
      button.setAttribute("aria-haspopup", "dialog");
      button.addEventListener("click", function () { openLightbox(button); });
    });

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox || event.target.classList.contains("lightbox-image")) {
        closeLightbox();
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && lightbox.classList.contains("open")) {
        closeLightbox();
      }
    });
  }
})();
