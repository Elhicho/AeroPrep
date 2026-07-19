# AeroPrep Ahmed

Application personnelle de revision et de preparation aux entretiens, publiee dans le sous-dossier `aeroprep/` du portfolio.

## Identification locale

La premiere visite cree un compte local sur l'appareil. Le mot de passe est derive avec PBKDF2-SHA-256 (210 000 iterations et sel aleatoire) et n'est jamais stocke en clair. Cinq erreurs consecutives declenchent un verrouillage temporaire.

GitHub Pages etant un hebergement statique public, cette identification constitue une barriere locale et non une protection serveur des fichiers sources.

## Contenu

- profil, pitchs et 17 fiches projets ;
- 115 notions et abreviations ;
- neuf parties d'introduction a l'aeronautique avec tests ;
- quiz quotidien ;
- simulateur d'entretien ;
- progression sauvegardee localement.

Le contenu principal est compresse en neuf fragments afin de conserver une publication autonome sans dependances externes.
