# Validation du paquet de publication AeroPrep

## Contrôles réussis

- Les empreintes SHA-256 des 12 fichiers de l'application correspondent au manifeste.
- Les neuf fragments `payload-part-*.txt` se concatènent, se décodent en Base64 et se décompressent correctement en GZIP.
- Le document reconstruit contient 324 758 octets et porte le titre `AeroPrep Ahmed`.
- Les sections principales sont présentes : profil, projets, glossaire, quiz quotidien, entretiens et parcours aéronautique.
- `auth.js` passe le contrôle syntaxique `node --check`.
- La page d'identification référence bien `auth.css` et `auth.js`.
- Le script de publication ne remplace que le dossier `aeroprep/`, crée une branche dédiée, ouvre une pull request, la fusionne en squash et vérifie les fichiers essentiels sur GitHub Pages.

## Limite du contrôle dans l'environnement d'exécution

Le navigateur Chromium de l'environnement bloque administrativement les URL `http://127.0.0.1` et `file://`. Le parcours visuel automatisé de création de compte n'a donc pas pu être rejoué ici. Cette limitation vient du navigateur isolé, pas des fichiers de l'application.

## État GitHub observé avant publication finale

Le dépôt contient déjà la page de connexion, son style et les fragments 1 et 2. Le paquet final ajoute `auth.js` ainsi que les fragments 3 à 9 et remplace le dossier `aeroprep/` de façon atomique.
