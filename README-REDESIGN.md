# Arsalane Soutien — Frontend redesign

This folder is a complete replacement for the public frontend.

It intentionally assumes the existing repository assets remain in `images/opt/`:
- logo.webp / mark.webp
- salle_etude_wide.jpg
- salle2.jpg
- salle_reunion.jpg / salle_reunion_wide.jpg
- staff.webp
- the 8 edt_*.jpg files

Replace:
- index.html
- css/styles.css
- js/main.js
- js/config.js

The redesign keeps only factual center information already present in the existing public site/repository. It does not add fabricated testimonials, statistics, teachers, claims or services.

The first screen deliberately does NOT lead with a room photo. It establishes the brand, the offer, supported levels and primary actions first. Real center photography appears later where it supports the story.


## Blank-page fix
The first version used `.reveal { opacity: 0 }` by default. If JavaScript failed to execute, every section remained invisible. This version uses a safe progressive-enhancement pattern: content is visible by default, and JavaScript enables the reveal animation only when it is actually available. A timeout fallback also makes every reveal visible after 1.8 seconds.
