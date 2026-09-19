/* Keep centre-specific links in one place if you later connect the public site
   to the management application. The public redesign itself uses direct links
   so it also works as a standalone static site. */

window.ARSALANE_CONFIG = {
  phone1: "+212708300484",
  phone2: "+212708602400",
  instagram: "https://www.instagram.com/arsalanesoutien_/",
  facebook: "https://www.facebook.com/arsalanesoutien",
  maps: "https://www.google.com/maps?q=33.2304375,-8.5190625",

  /* Inscription en ligne — API publique de la plateforme de gestion Django,
     servie depuis le sous-domaine caisse.arsalanesoutien.com (PAS ce site
     statique lui-même : il n'y a pas de backend ici). */
  registrationOptionsUrl: "https://caisse.arsalanesoutien.com/api/public/registration-options/",
  registrationApiUrl: "https://caisse.arsalanesoutien.com/api/public/online-registrations/"
};
