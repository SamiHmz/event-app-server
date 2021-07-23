const etat = {
  ATENTE: "en attente",
  APROUVER: "approuvé",
  REJETER: "rejetè",
};

const roles = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  SIMPLE: "simple",
};

const typeEvenement = [
  "Exposition",
  "Salon",
  "Confèrence",
  "Workshop",
  "Formation",
  "Visit",
  "Compètision",
];

const typeUtilisateur = {
  ADMINISTRATEUR: "administrateur",
  INITIATEUR: "initiateur",
};
const typeInitiateur = ["club", "association"];
const modeEvenement = ["Prèsentiel", "En Ligne"];
const typeIntervenant = ["interne", "externe"];

const modeSponsoring = ["espèce", "matériel"];
const media = ["tv", "radio", "journal", "journal", "jouranl en ligne"];
const langue = ["Francais,Anglais,Arabe"];
const sexe = ["homme", "femme"];

module.exports = {
  etat,
  roles,
  typeEvenement,
  modeEvenement,
  typeInitiateur,
  modeSponsoring,
  typeUtilisateur,
  media,
  langue,
  sexe,
  typeIntervenant,
};
