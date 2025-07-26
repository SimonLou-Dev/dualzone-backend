# DUALZONE- Backend du site
## Plateforme de jeu compétitif 1v1 et 2v2
### Projet annuel 2024-2025 ESGI B3 

---

# Contributeurs

- [Bidet Simon](https://github.com/SimonLou-Dev)
- [Renault Rémi](https://github.com/gruv0o)
- [Anton MAZANY](https://github.com/ManMazFR)

# Présentation générale

Cette plateforme vise à offrir un environnement de jeu compétitif sécurisé et performant pour des matchs 1v1 et 2v2 de Counter-Strike. Inspirée par des plateformes reconnues comme Faceit et ESEA, elle met l'accent sur la sécurité, la modération et la performance. Elle répond à la demande croissante de joueurs cherchant des environnements bien régulés et sécurisés.

# Description

Le backend du site est développé avec le framework AdonisJS en TypeScript. Il est responsable du système d'élo, de l'allocation des serveurs de jeux, et de la connexion des joueurs via Steam. Ce dépôt contient toute la logique métier et les services nécessaires pour soutenir ces fonctionnalités.

# Technologies utilisées

- Node.js : Pour l'exécution du code backend.
- AdonisJS : Un framework Node.js open-source et français, choisi pour sa structure robuste et sa philosophie orientée développeur.
- PostgreSQL : Pour la persistance des données structurées.
- Redis : Pour le cache serveur et la gestion des événements.

# Fonctionnalités principales

- Système d'élo : Un système de classement des joueurs basé sur la méthode Elo, permettant de comparer les performances.
- Allocation des serveurs de jeux : Logique pour attribuer des serveurs de jeux aux joueurs en fonction du matchmaking.
- Authentification via Steam : Utilisation de OAuth de Steam pour l'authentification sécurisée des joueurs.
