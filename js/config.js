/* =========================================================================
   Arsalane Soutien — configuration du site public
   -------------------------------------------------------------------------
   Un seul endroit à modifier pour :
     • le lien vers l'application de gestion interne (Espace administration)
     • l'adresse de l'API de contact (voir README, section « Formulaire de contact »)

   Après un changement de domaine, ne modifiez que ce fichier.
   ========================================================================= */
window.ARSALANE_CONFIG = {
  /* Lien du bouton « Espace administration ».
     Domaine actuel de l'application de gestion Django. */
  ADMIN_URL: "https://www.arsalanesoutien.com/gestion/",

  /* Endpoint qui reçoit le formulaire de contact.
     Doit pointer vers l'application Django (…/api/contact/).
     Laisser vide ("") pour désactiver le formulaire et n'afficher
     que le téléphone / l'adresse. */
  CONTACT_API_URL: "https://www.arsalanesoutien.com/api/contact/",

  /* Numéro affiché et utilisé dans les liens « Appeler ». */
  PHONE_DISPLAY: "07 08 30 04 84",
  PHONE_TEL: "+212708300484",
};
