# Effets 3D pour la carte de suivi

## Résultat attendu
Transformer la carte actuelle en une simulation de livraison plus immersive, tout en conservant les itinéraires, la progression et les données existantes.

## Modifications
- Ajouter un mode perspective 3D activable depuis les commandes de la carte.
- Incliner et donner de la profondeur à la carte avec une transition fluide, des ombres et un éclairage subtil.
- Remplacer l’emoji mobile par un marqueur de transport en relief, orienté selon le trajet et adapté à la route, au rail, à l’air ou à la mer.
- Renforcer la profondeur de l’itinéraire, des points de départ/arrivée et de la portion déjà parcourue.
- Ajouter un léger mouvement de caméra lorsque l’utilisateur suit le colis, sans gêner la lecture.
- Garder une présentation claire et utilisable sur mobile, en plein écran et avec réduction des animations si le téléphone le demande.

## Vérification
- Tester les vues ordinateur et mobile.
- Vérifier le tracé, le déplacement selon la progression, les commandes 3D et plein écran.
- Contrôler l’absence d’erreurs visibles dans le navigateur.

## Détails techniques
La carte Leaflet et son système d’itinéraire restent en place. Les effets 3D seront ajoutés autour de la couche cartographique et des marqueurs afin de préserver OSRM, le géocodage, les quatre moyens de transport et les performances mobiles.
