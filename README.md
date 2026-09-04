# Arsalane Soutien — site public

Site vitrine statique du centre de soutien scolaire **Arsalane Soutien** (El Jadida).
HTML + CSS + JavaScript vanilla. Aucune dépendance, aucun build, aucun framework.

Il est **séparé** de l'application de gestion Django (`../arsalanesoutien/`) : ce dépôt
ne contient que la vitrine marketing publique.

Direction : **un portrait éditorial du centre** — photographie réelle, typographie,
filets, composition asymétrique. Deux signatures : la numérotation éditoriale des
sections (01, 02…) dans une marge étroite à filet ; le contenu qui commence
colonne 2 tandis que la photographie déborde vers les bords.
Titrage / éditorial en **Newsreader** (serif), texte et interface en
**Hanken Grotesk**. Chargés depuis Google Fonts.

---

## Aperçu local

```bash
python3 -m http.server 8000
```

puis ouvrir <http://localhost:8000>. (Ou tout serveur statique : `npx serve`, Live Server…)

---

## Structure

```
arsalanestatic/
├── index.html          Page unique :
│                          couverture · 01 Le centre · 02 Niveaux · 03 Emploi du temps
│                          planche photo · 04 L'approche · 05 L'équipe · 06 Le cadre
│                          Suivre · 07 Contact
├── css/
│   └── styles.css       Tout le style (variables de thème en haut du fichier)
├── js/
│   ├── config.js        ⚙️  Liens, numéros, comptes, crédit (voir plus bas)
│   └── main.js          Menu mobile, en-tête au défilement, nav active, formulaire,
│                          visionneuse « Emploi du temps »
├── images/
│   ├── logo.png                          Logo officiel complet (source)
│   ├── staff.png                         Affiche « Staff pédagogique 2026-2027 » (source, fournie par le centre)
│   ├── salle_etude.jpeg / salle2.jpeg / salle_reunion.jpeg   Photos du centre (sources)
│   ├── edt/                              Les 8 emplois du temps (sources, fournis par le centre) :
│   │     edt_primaire_ce5 / _ce6 · edt_college_1ac / _2ac / _3ac
│   │     edt_lycee_tronc_commun / _1bac / _2bac_pcsvt
│   └── opt/                              Versions servies (WebP + repli JPEG/PNG) :
│         mark.png/.webp        pastille du logo (en-tête + pied de page)
│         logo.webp             logo complet (référence, non affiché tel quel)
│         salle_etude.*         couverture — portrait, plein cadre à droite
│         salle_etude_sm.*      couverture — variante mobile (srcset)
│         salle_reunion_wide.*  planche photo pleine largeur
│         salle_etude_wide.*    galerie « Le cadre »
│         salle2.* / salle_reunion.*   galerie « Le cadre »
│         staff.*               section « L'équipe » — affiche du centre
│         edt_*.*               section « Emploi du temps » — mêmes fichiers pour
│                                la vignette et la visionneuse (pas de recadrage)
├── .nojekyll            Indique à GitHub Pages de servir les fichiers tels quels
├── .gitignore           .DS_Store, etc.
├── favicon.svg
├── CNAME · robots.txt · sitemap.xml
└── README.md
```

`reception.jpeg` a été retirée : elle montrait l'enseigne d'un autre centre
(« Good-Luck Private Center ») et n'était déjà plus utilisée.

### Régénérer les images optimisées

Sources dans `images/`, versions servies dans `images/opt/` (WebP + repli JPEG/PNG) :

```bash
cd images
# portraits (couverture, galerie) — plein cadre redimensionné
sips -Z 1280 -s format jpeg -s formatOptions 82 salle_etude.jpeg --out opt/salle_etude.jpg
cwebp -q 80 -m 6 salle_etude.jpeg -o opt/salle_etude.webp
sips -Z 620 -s format jpeg -s formatOptions 80 salle_etude.jpeg --out opt/salle_etude_sm.jpg
cwebp -q 78 -m 6 opt/salle_etude_sm.jpg -o opt/salle_etude_sm.webp

# recadrages paysage (centrés)
sips -c 540 960 salle_reunion.jpeg --out /tmp/w.jpg   # planche photo  960×540
sips -c 640 960 salle_etude.jpeg   --out /tmp/g.jpg   # galerie        960×640
#   puis : sips -s format jpeg -s formatOptions 82 … + cwebp -q 80 -m 6 …

# affiche de l'équipe — garder une résolution suffisante pour les noms
cwebp -q 90 -m 6 opt/staff.png -o opt/staff.webp
```

---

## Ce qui se modifie facilement

| Quoi | Où |
| --- | --- |
| **Espace administration**, téléphones (×2), Instagram, Facebook, lien Google Maps, crédit développeur | `js/config.js` — un seul fichier |
| **Adresse postale** | `index.html` (section `#contact`, pied de page) + le bloc JSON-LD dans `<head>` |
| **Niveaux** | `index.html`, section `#niveaux` — liste `<ol class="levels">` (bloc `<!-- ÉDITABLE -->`) |
| **Matières** | `index.html`, `<p class="matieres">` de la section `#niveaux` |
| **Équipe** | remplacer `images/staff.png` puis régénérer `opt/staff.webp` ; ne pas inventer de texte |
| **Emplois du temps** | `index.html`, section `#emploi-du-temps` — un `<li><button class="edt__item">` par image (bloc `<!-- ÉDITABLE -->`) ; remplacer l'image dans `images/edt/`, régénérer le WebP (voir ci-dessus), garder le même `<figcaption>`. La visionneuse (`js/main.js`) lit directement le DOM — aucune liste à synchroniser ailleurs. |
| **Couleurs / typographie** | `css/styles.css`, bloc `:root` |
| **Domaine canonique / Open Graph** | `index.html` `<head>` + `CNAME` + `sitemap.xml` |

Aucun CMS : tout est du HTML éditable à la main.

---

## `js/config.js`

```js
ADMIN_URL         lien du bouton « Espace administration » (app Django)
CONTACT_API_URL   endpoint du formulaire « Écrire au centre » ; "" pour le masquer
PHONE_1_*, PHONE_2_*   affichage (format local) + lien tel: (format international)
INSTAGRAM_URL     https://www.instagram.com/arsalanesoutien_/
FACEBOOK_URL      https://www.facebook.com/arsalanesoutien
MAPS_URL          fiche Google Maps (« Itinéraire »)
DEV_NAME, DEV_URL crédit du pied de page ; DEV_URL vide → texte simple, sinon lien
```

Le lien Facebook n'a pas pu être vérifié hors connexion (Facebook bloque la
consultation déconnectée) ; c'est le compte affiché sur l'affiche du centre.
Corriger `FACEBOOK_URL` si besoin.

---

## Carte

La carte est un `<iframe>` Google Maps **sans clé API**, dans la section `#contact` :

```
https://www.google.com/maps?q=33.2304375,-8.5190625&hl=fr&z=17&output=embed
```

Chargée en `loading="lazy"` : elle n'apparaît qu'en s'approchant de la section
(normal si elle semble vide juste après le chargement).

---

## Formulaire « Écrire au centre »

Le formulaire (`#contact-form`) envoie les messages **à l'application Django** via
`POST CONTACT_API_URL` (JSON). L'endpoint `…/api/contact/` : n'accepte que l'origine
du site public (`PUBLIC_SITE_ORIGINS`), applique un pot de miel + une limite par IP,
et crée un message visible dans **Gestion → Messages**.

- `CONTACT_API_URL` **vide** → le formulaire est remplacé par un bouton « Appeler le centre ».
- API injoignable / erreur → message d'erreur affiché avec le téléphone en repli.

---

## Déploiement (à faire par le propriétaire)

Dossier de fichiers statiques : se publie tel quel (GitHub Pages, Netlify, Vercel,
Cloudflare Pages, OVH…).

1. Renseigner le domaine dans `js/config.js`, `index.html` (`canonical`, `og:`),
   `CNAME` et `sitemap.xml`.
2. Publier le contenu de ce dossier à la racine de `arsalanesoutien.com`.
3. Côté Django : `PUBLIC_SITE_ORIGINS=https://arsalanesoutien.com` pour le formulaire.

**GitHub Pages :** `.nojekyll` est présent (sert les fichiers tels quels). Si un
déploiement reste bloqué (« Deploy to GitHub Pages … Timeout »), c'est en général le
certificat du domaine personnalisé : Settings → Pages → retirer puis re-saisir le
domaine, attendre le certificat, puis relancer le déploiement.

Aucun serveur, aucune base, aucun build.

---

*Site développé par Yasser Mansour.*
