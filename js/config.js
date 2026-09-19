/* Keep centre-specific links in one place if you later connect the public site
   to the management application. The public redesign itself uses direct links
   so it also works as a standalone static site. */

window.ARSALANE_CONFIG = {
  phone1: "+212708300484",
  phone2: "+212708602400",
  instagram: "https://www.instagram.com/arsalanesoutien_/",
  facebook: "https://www.facebook.com/arsalanesoutien",
  maps: "https://www.google.com/maps?q=33.2304375,-8.5190625",

  /* Inscription en ligne — API publique de la plateforme de gestion Django.
     Ces deux endpoints n'existent pas encore côté gestion au moment où ce
     fichier est écrit ; le formulaire fonctionne déjà (niveaux/filières
     réels du site en repli) et s'activera tout seul dès que l'URL de
     soumission répondra. Mettre à jour ces deux lignes si le chemin final
     retenu côté Django diffère. */
  registrationOptionsUrl: "https://www.arsalanesoutien.com/api/public/registration-options/",
  registrationApiUrl: "https://www.arsalanesoutien.com/api/public/online-registration/"
};
