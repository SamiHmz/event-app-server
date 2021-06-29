etat = {
  ATENTE: "en attente",
  APROUVER: "approuvé",
  REJETER: "rejetè",
};

roles = {
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
const typeInitiateur = ["club", "association"];

const modeEvenement = ["Prèsentiel", "En Ligne"];

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
  media,
  langue,
  sexe,
};
