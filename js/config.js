/* =========================================================================
   Arsalane Soutien — configuration du site public
   -------------------------------------------------------------------------
   Un seul fichier à modifier pour les liens, numéros et comptes.
   Après un changement de domaine ou de coordonnées, ne toucher qu'ici.
   ========================================================================= */
window.ARSALANE_CONFIG = {
  /* Bouton « Espace administration » — application de gestion Django. */
  ADMIN_URL: "https://www.arsalanesoutien.com/gestion/",

  /* Endpoint qui reçoit le formulaire « Écrire au centre » (…/api/contact/).
     Laisser vide ("") pour masquer le formulaire et n'afficher que le téléphone. */
  CONTACT_API_URL: "https://www.arsalanesoutien.com/api/contact/",

  /* Téléphones — affichage en format local, lien en format international. */
  PHONE_1_DISPLAY: "07 08 30 04 84",
  PHONE_1_TEL: "+212708300484",
  PHONE_2_DISPLAY: "07 08 60 24 00",
  PHONE_2_TEL: "+212708602400",

  /* Réseaux sociaux. */
  INSTAGRAM_URL: "https://www.instagram.com/arsalanesoutien_/",
  FACEBOOK_URL: "https://www.facebook.com/arsalanesoutien",

  /* Fiche Google Maps (boutons « Itinéraire » / « Ouvrir dans Google Maps »).
     La carte intégrée utilise, elle, les coordonnées directement dans l'iframe. */
  MAPS_URL: "https://www.google.com/maps/place/Arsalane+Soutien/@33.2303918,-8.5191615,21z/data=!4m6!3m5!1s0xda91dcc9c5b833b:0x93087b9d064d4077!8m2!3d33.2304375!4d-8.5190625!16s%2Fg%2F11lnfh4czw",

  /* Crédit développeur (pied de page). DEV_URL vide → simple texte. */
  DEV_NAME: "Yasser Mansour",
  DEV_URL: "",
};
