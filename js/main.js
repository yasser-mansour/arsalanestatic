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
  var btn = document.querySelector(".menu-button");
  var nav = document.getElementById("main-nav");
  function closeMenu() {
    if (!nav) return;
    nav.classList.remove("mobile-open");
    if (btn) {
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Ouvrir le menu");
    }
  }
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("mobile-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) closeMenu();
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

/* =========================================================================
   Inscription en ligne — modale, niveaux/filières, envoi de la demande.
   La demande d'inscription n'est PAS une inscription confirmée : le centre
   recontacte le visiteur ensuite. Voir js/config.js pour les deux URL
   (registrationOptionsUrl / registrationApiUrl) côté plateforme de gestion.
   ========================================================================= */
(function () {
  "use strict";

  var modal = document.getElementById("registration-modal");
  var form = document.getElementById("registration-form");
  if (!modal || !form) return;

  var CFG = window.ARSALANE_CONFIG || {};

  /* Niveaux réels du centre (section #niveaux / #horaires de ce site).
     Seul le 2e Bac a une filière confirmée (PC / SVT) : on n'invente rien
     pour les autres niveaux. Sert de repli tant que registrationOptionsUrl
     ne répond pas encore côté gestion. */
  var FALLBACK_LEVELS = [
    { id: "primaire-5e", label: "Primaire — 5e année" },
    { id: "primaire-6e", label: "Primaire — 6e année" },
    { id: "college-1ac", label: "Collège — 1re année" },
    { id: "college-2ac", label: "Collège — 2e année" },
    { id: "college-3ac", label: "Collège — 3e année" },
    { id: "lycee-tc", label: "Lycée — Tronc commun" },
    { id: "lycee-1bac", label: "Lycée — 1re année Bac" },
    {
      id: "lycee-2bac",
      label: "Lycée — 2e année Bac",
      tracks: [
        { id: "pc", label: "PC — Physique-Chimie" },
        { id: "svt", label: "SVT" }
      ]
    }
  ];

  var panel = modal.querySelector(".reg-modal__panel");
  var bodyEl = document.getElementById("reg-body");
  var closeBtn = document.getElementById("reg-close");
  var levelSelect = document.getElementById("reg-level");
  var trackField = document.getElementById("reg-track-field");
  var trackSelect = document.getElementById("reg-track");
  var nameInput = document.getElementById("reg-name");
  var studentPhoneInput = document.getElementById("reg-student-phone");
  var parentPhoneInput = document.getElementById("reg-parent-phone");
  var submitBtn = document.getElementById("reg-submit");
  var statusEl = document.getElementById("reg-status");

  var levels = [];
  var opener = null;

  /* ---- Ouverture / fermeture -------------------------------------- */
  function openModal(trigger) {
    opener = trigger || document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeydown);
    window.setTimeout(function () {
      if (nameInput) nameInput.focus();
    }, 10);
  }
  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (opener && typeof opener.focus === "function") opener.focus();
  }
  function onKeydown(e) {
    if (e.key === "Escape") {
      closeModal();
      return;
    }
    if (e.key === "Tab") trapFocus(e);
  }
  function trapFocus(e) {
    var focusables = Array.prototype.filter.call(
      panel.querySelectorAll("input, select, button, a[href]"),
      function (el) { return !el.disabled && el.offsetParent !== null; }
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-open-registration]"), function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      openModal(btn);
    });
  });
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-reg-close") || e.target.closest("[data-reg-close]")) closeModal();
  });

  /* ---- Niveaux / filières ------------------------------------------ */
  function findLevel(id) {
    for (var i = 0; i < levels.length; i++) {
      if (levels[i].id === id) return levels[i];
    }
    return null;
  }

  function fillSelect(select, items, placeholderText) {
    select.innerHTML = "";
    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = placeholderText;
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);
    items.forEach(function (item) {
      var opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = item.label;
      select.appendChild(opt);
    });
  }

  function updateTracks() {
    var level = findLevel(levelSelect.value);
    var tracks = level && level.tracks ? level.tracks : [];
    if (!tracks.length) {
      trackField.hidden = true;
      trackSelect.required = false;
      trackSelect.value = "";
      return;
    }
    fillSelect(trackSelect, tracks, "Choisir une filière");
    trackField.hidden = false;
    trackSelect.required = true;
  }

  function fillLevels(list) {
    levels = list;
    fillSelect(levelSelect, list, "Choisir un niveau");
    levelSelect.disabled = false;
    updateTracks();
  }

  levelSelect.addEventListener("change", updateTracks);

  function loadLevels() {
    var url = CFG.registrationOptionsUrl;
    if (!url) {
      fillLevels(FALLBACK_LEVELS);
      return;
    }
    fetch(url, { headers: { Accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error("bad status");
        return r.json();
      })
      .then(function (data) {
        if (data && Array.isArray(data.levels) && data.levels.length) {
          fillLevels(data.levels);
        } else {
          fillLevels(FALLBACK_LEVELS);
        }
      })
      .catch(function () {
        // Endpoint pas encore en ligne côté gestion : le formulaire reste
        // utilisable avec les niveaux réels déjà connus de ce site.
        fillLevels(FALLBACK_LEVELS);
      });
  }

  /* ---- Validation ---------------------------------------------------- */
  function clearErrors() {
    Array.prototype.forEach.call(form.querySelectorAll(".reg-error"), function (el) { el.textContent = ""; });
    Array.prototype.forEach.call(form.querySelectorAll(".reg-field"), function (el) { el.classList.remove("has-error"); });
  }
  function setFieldError(input, message) {
    var field = input.closest(".reg-field");
    if (field) field.classList.add("has-error");
    var err = form.querySelector('[data-error-for="' + input.id + '"]');
    if (err) err.textContent = message;
  }
  function isValidPhone(value) {
    var digits = value.replace(/[\s.\-()]/g, "");
    return /^(?:\+212|0)[5-7]\d{8}$/.test(digits);
  }
  function normalizePhone(value) {
    var digits = value.replace(/[\s.\-()]/g, "");
    if (digits.indexOf("0") === 0) return "+212" + digits.slice(1);
    return digits;
  }

  function validate() {
    clearErrors();
    var ok = true;
    if (!nameInput.value.trim()) {
      setFieldError(nameInput, "Merci d'indiquer le nom complet de l'élève.");
      ok = false;
    }
    if (!levelSelect.value) {
      setFieldError(levelSelect, "Veuillez sélectionner un niveau.");
      ok = false;
    }
    if (!trackField.hidden && trackSelect.required && !trackSelect.value) {
      setFieldError(trackSelect, "Veuillez sélectionner une filière.");
      ok = false;
    }
    if (!studentPhoneInput.value.trim()) {
      setFieldError(studentPhoneInput, "Merci d'indiquer un numéro de téléphone.");
      ok = false;
    } else if (!isValidPhone(studentPhoneInput.value)) {
      setFieldError(studentPhoneInput, "Veuillez saisir un numéro de téléphone valide.");
      ok = false;
    }
    if (parentPhoneInput.value.trim() && !isValidPhone(parentPhoneInput.value)) {
      setFieldError(parentPhoneInput, "Veuillez saisir un numéro de téléphone valide.");
      ok = false;
    }
    return ok;
  }

  /* ---- Envoi ----------------------------------------------------------- */
  function setStatus(message, kind) {
    statusEl.textContent = message;
    statusEl.className = "reg-status" + (kind ? " is-" + kind : "");
  }

  function applyServerErrors(body) {
    if (!body || !body.errors) return;
    var map = {
      student_full_name: nameInput,
      level_id: levelSelect,
      track_id: trackSelect,
      student_phone: studentPhoneInput,
      parent_phone: parentPhoneInput
    };
    for (var key in body.errors) {
      if (map[key]) setFieldError(map[key], body.errors[key]);
    }
  }

  function showSuccess(message, reference) {
    var html =
      '<div class="reg-success">' +
      '<p class="eyebrow">Demande envoyée ✓</p>' +
      "<h3>Merci.</h3>" +
      "<p>" +
      (message || "Votre demande d'inscription a bien été transmise à Arsalane Soutien. Notre équipe vous contactera prochainement.") +
      (reference ? '<span class="reg-ref">Référence : ' + reference + "</span>" : "") +
      "</p>" +
      '<a class="link-arrow dark" href="#" data-reg-close>Fermer</a>' +
      "</div>";
    bodyEl.innerHTML = html;
    var closeLink = bodyEl.querySelector("[data-reg-close]");
    if (closeLink) {
      closeLink.addEventListener("click", function (e) { e.preventDefault(); closeModal(); });
      closeLink.focus();
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.dataset.sending === "1") return;
    if (form.website && form.website.value) return; // pot de miel

    if (!validate()) return;

    var url = CFG.registrationApiUrl;
    if (!url) {
      setStatus("L'inscription en ligne n'est pas encore activée. Vous pouvez appeler le centre au 07 08 30 04 84.", "error");
      return;
    }

    var level = findLevel(levelSelect.value);
    var track = null;
    if (!trackField.hidden && level && level.tracks) {
      for (var i = 0; i < level.tracks.length; i++) {
        if (level.tracks[i].id === trackSelect.value) track = level.tracks[i];
      }
    }

    var payload = {
      student_full_name: nameInput.value.trim(),
      level_id: levelSelect.value,
      level_label: level ? level.label : levelSelect.options[levelSelect.selectedIndex].textContent,
      track_id: track ? track.id : null,
      track_label: track ? track.label : null,
      student_phone: normalizePhone(studentPhoneInput.value.trim()),
      parent_phone: parentPhoneInput.value.trim() ? normalizePhone(parentPhoneInput.value.trim()) : null
    };

    form.dataset.sending = "1";
    submitBtn.disabled = true;
    var originalLabel = submitBtn.textContent;
    submitBtn.textContent = "Envoi…";
    setStatus("Envoi en cours…", "");

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (body) {
          return { ok: r.ok, status: r.status, body: body };
        });
      })
      .then(function (res) {
        if (res.ok && res.body && res.body.success !== false) {
          showSuccess(res.body.message, res.body.reference);
        } else if (res.status === 409) {
          setStatus((res.body && res.body.message) || "Une demande récente existe déjà avec ces informations.", "error");
        } else if (res.status === 422 || res.status === 400) {
          applyServerErrors(res.body);
          setStatus((res.body && res.body.message) || "Merci de vérifier les informations saisies.", "error");
        } else {
          setStatus("Nous n'avons pas pu envoyer votre demande pour le moment. Vérifiez votre connexion et réessayez.", "error");
        }
      })
      .catch(function () {
        setStatus("Nous n'avons pas pu envoyer votre demande pour le moment. Vérifiez votre connexion et réessayez.", "error");
      })
      .finally(function () {
        form.dataset.sending = "0";
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      });
  });

  loadLevels();
})();
