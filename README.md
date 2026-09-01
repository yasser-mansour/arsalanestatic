# Arsalane Soutien — site public

Site vitrine statique du centre de soutien scolaire **Arsalane Soutien** (El Jadida).
HTML + CSS + JavaScript vanilla. Aucune dépendance, aucun build, aucun framework.

Il est **séparé** de l'application de gestion Django (`../arsalanesoutien/`) : ce dépôt
ne contient que la vitrine marketing publique.

---

## Aperçu local

Le site est un ensemble de fichiers statiques. Depuis ce dossier :

```bash
python3 -m http.server 8000
```

puis ouvrir <http://localhost:8000>.

(Ou n'importe quel serveur statique : `npx serve`, extension « Live Server », etc.
Ouvrir `index.html` directement en `file://` fonctionne aussi, mais le formulaire de
contact et la police web se comportent mieux via un serveur.)

---

## Structure

```
arsalanestatic/
├── index.html          Page unique (toutes les sections)
├── css/
│   └── styles.css       Tout le style (variables de thème en haut du fichier)
├── js/
│   ├── config.js        ⚙️  Liens & numéros à modifier (voir plus bas)
│   └── main.js          Menu mobile, apparitions au défilement, formulaire
├── images/
│   ├── logo.png         Logo officiel (source)
│   ├── salle_etude.jpeg, salle2.jpeg, salle_reunion.jpeg
│   ├── reception.jpeg   ⚠️  NON utilisée — visible dessus le nom d'un autre centre ; à supprimer
│   └── opt/             Versions optimisées (WebP + JPEG redimensionné) utilisées par le site
│                        mark.png / mark.webp = pastille du logo (fond transparent)
├── favicon.svg
├── robots.txt / sitemap.xml
└── README.md
```

### Régénérer les images optimisées

Les photos sources sont dans `images/`. Les versions servies sont dans `images/opt/`
(WebP haute qualité + repli JPEG). Pour les recréer après avoir remplacé une photo :

```bash
cd images
cwebp -q 82 -m 6 salle_etude.jpeg -o opt/salle_etude.webp   # idem pour les autres
sips -Z 960 -s formatOptions 80 salle_etude.jpeg --out opt/salle_etude.jpg
```

---

## Ce qui se modifie facilement

| Quoi | Où |
| --- | --- |
| **Lien « Espace administration »** | `js/config.js` → `ADMIN_URL` (un seul endroit) |
| **Adresse de l'API du formulaire de contact** | `js/config.js` → `CONTACT_API_URL` |
| **Numéro de téléphone** (affichage + liens `tel:`) | `js/config.js` → `PHONE_DISPLAY` / `PHONE_TEL` |
| **Adresse postale** | `index.html` (sections *Contact*, *Nous trouver*, pied de page) + le bloc JSON-LD dans `<head>` |
| **Niveaux / matières / offre** | `index.html`, section `#nos-cours` — blocs `<article class="offer__item">` balisés `<!-- ÉDITABLE -->` |
| **Couleurs / typographie** | `css/styles.css`, bloc `:root` en haut |
| **Domaine canonique / Open Graph** | `index.html` `<head>` (`<link rel="canonical">`, balises `og:`) |

Aucun contenu n'est géré par un CMS : tout est du HTML éditable à la main.

---

## Carte « Nous trouver »

Section `#nous-trouver`. La carte est un `<iframe>` Google Maps **sans clé API** :

```
https://www.google.com/maps?q=33.2304375,-8.5190625&hl=fr&z=17&output=embed
```

Le bouton **« Ouvrir dans Google Maps »** pointe vers la fiche du lieu fournie par le centre.
Coordonnées : `33.2304375, -8.5190625`.

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
