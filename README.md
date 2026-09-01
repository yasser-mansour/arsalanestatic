# Arsalane Soutien — site public

Site vitrine statique du centre de soutien scolaire **Arsalane Soutien** (El Jadida).
HTML + CSS + JavaScript vanilla. Aucune dépendance, aucun build, aucun framework.

Il est **séparé** de l'application de gestion Django (`../arsalanesoutien/`) : ce dépôt
ne contient que la vitrine marketing publique.

Direction éditoriale : une mise en page à la « cahier d'école » — marge à filet,
index à deux chiffres par section (01, 02…), photographie du centre en pleine largeur.
Titrage en **Fraunces** (serif), texte en **IBM Plex Sans**, repères/légendes en
**IBM Plex Mono**.

---

## Aperçu local

Le site est un ensemble de fichiers statiques. Depuis ce dossier :

```bash
python3 -m http.server 8000
```

puis ouvrir <http://localhost:8000>.

(Ou n'importe quel serveur statique : `npx serve`, extension « Live Server », etc.
Ouvrir `index.html` directement en `file://` fonctionne aussi, mais le formulaire de
contact et les polices web se comportent mieux via un serveur.)

---

## Structure

```
arsalanestatic/
├── index.html          Page unique : couverture, 01 Le centre, 02 Niveaux,
│                        03 Le cadre, 04 L'équipe, 05 Contact, 06 Nous trouver
├── css/
│   └── styles.css       Tout le style (variables de thème en haut du fichier)
├── js/
│   ├── config.js        ⚙️  Liens, numéros et comptes à modifier (voir plus bas)
│   └── main.js          Menu mobile, en-tête au défilement, formulaire
├── images/
│   ├── logo.png          Logo officiel complet (source)
│   ├── staff.png          Affiche « Staff pédagogique 2026-2027 » (source, fournie par le centre)
│   ├── salle_etude.jpeg, salle2.jpeg, salle_reunion.jpeg   Photos du centre (sources)
│   └── opt/               Versions optimisées (WebP + JPEG/PNG) utilisées par le site :
│                           mark.png/.webp        pastille du logo (fond transparent, dans l'en-tête et le pied de page)
│                           logo.webp             logo complet (référence — non affiché tel quel sur le site)
│                           salle_etude.*          couverture (portrait, plein cadre à droite)
│                           salle_reunion_wide.*    section « Le cadre », bandeau plein écran
│                           salle2.*                section « Le cadre », photo décalée
│                           staff.*                 section « L'équipe », affiche du centre
├── favicon.svg
├── robots.txt / sitemap.xml
└── README.md
```

`reception.jpeg` a été retirée : elle montrait l'enseigne d'un autre centre
(« Good-Luck Private Center ») et n'était déjà plus utilisée.

### Régénérer les images optimisées

Les photos sources sont dans `images/`. Les versions servies sont dans `images/opt/`
(WebP + repli JPEG/PNG). Pour reproduire le bandeau large de « Le cadre » ou les
autres dérivés après avoir remplacé une photo :

```bash
cd images
cwebp -q 80 -m 6 salle_etude.jpeg -o opt/salle_etude.webp
sips -Z 1280 -s format jpeg -s formatOptions 82 salle_etude.jpeg --out opt/salle_etude.jpg

# bandeau large (recadrage centré 960×560) pour la section « Le cadre »
sips -c 560 960 salle_reunion.jpeg --out /tmp/wide.jpg
cwebp -q 80 -m 6 /tmp/wide.jpg -o opt/salle_reunion_wide.webp
sips -s format jpeg -s formatOptions 82 /tmp/wide.jpg --out opt/salle_reunion_wide.jpg

# affiche de l'équipe (garder une résolution suffisante pour que les noms restent lisibles)
cwebp -q 90 -m 6 staff.png -o opt/staff.webp
```

---

## Ce qui se modifie facilement

| Quoi | Où |
| --- | --- |
| **Espace administration**, téléphones, Instagram, Facebook, lien Google Maps | `js/config.js` — un seul fichier pour tous les liens et numéros |
| **Adresse postale** | `index.html` (sections *Contact*, *Nous trouver*, pied de page) + le bloc JSON-LD dans `<head>` |
| **Niveaux / matières** | `index.html`, section `#niveaux` — liste `<ol class="levels">` |
| **Équipe** | remplacer `images/staff.png` (et régénérer `opt/staff.webp`) ; ne pas modifier les textes de la section pour ne pas inventer de contenu |
| **Couleurs / typographie** | `css/styles.css`, bloc `:root` en haut |
| **Domaine canonique / Open Graph** | `index.html` `<head>` |

Aucun contenu n'est géré par un CMS : tout est du HTML éditable à la main.

---

## Carte « Nous trouver »

Section `#nous-trouver`. La carte est un `<iframe>` Google Maps **sans clé API** :

```
https://www.google.com/maps?q=33.2304375,-8.5190625&hl=fr&z=17&output=embed
```

Le bouton **« Ouvrir dans Google Maps »** (contact + section carte) et **« Itinéraire »**
utilisent `MAPS_URL` dans `js/config.js`. Coordonnées : `33.2304375, -8.5190625`.

La carte est chargée en `loading="lazy"` : elle n'apparaît qu'en s'approchant de la
section en scrollant (normal si elle semble vide immédiatement après le chargement
de la page).

---

## Formulaire de contact

Le formulaire (`#contact`) envoie les messages **à l'application Django** via
`POST CONTACT_API_URL` (JSON). Côté Django, l'endpoint `…/api/contact/` :

- n'accepte que l'origine du site public (variable d'environnement `PUBLIC_SITE_ORIGINS`) ;
- applique un pot de miel + une limite par adresse IP ;
- crée un message visible dans **Gestion → Messages**.

Comportements :

- `CONTACT_API_URL` **vide** dans `config.js` → le formulaire est remplacé par un bouton
  « Appeler le centre ». Aucune fausse soumission.
- API injoignable / erreur → message d'erreur affiché avec le numéro de téléphone en repli.

Tant que l'application Django n'expose pas cet endpoint (ou que `PUBLIC_SITE_ORIGINS`
n'autorise pas ce domaine), le formulaire échoue proprement et renvoie vers le téléphone.

---

## Déploiement (à faire par le propriétaire)

Le site est un dossier de fichiers statiques : il se publie tel quel sur n'importe quel
hébergement statique (Netlify, Vercel, Cloudflare Pages, GitHub Pages, OVH, un simple
bucket, etc.).

Étapes générales, **non exécutées ici** :

1. Renseigner le domaine définitif dans `js/config.js` (`ADMIN_URL`, `CONTACT_API_URL`)
   et dans `index.html` (`<link rel="canonical">`, balises `og:`, `sitemap.xml`).
2. Publier le contenu de ce dossier à la racine du domaine `arsalanesoutien.com`.
3. Côté application Django : définir `PUBLIC_SITE_ORIGINS=https://arsalanesoutien.com`
   pour autoriser le formulaire de contact.

Aucun serveur, aucune base de données, aucun processus de build n'est nécessaire pour
le site public.

---

*Site développé par Yasser Mansour.*
