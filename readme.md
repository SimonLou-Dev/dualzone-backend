# 🚀 **Guide de Développement - Backend Docker** 🚀

## /!\ **Avant chaque push /!\**

Surtout si c'est le dernier de votre **feature** ou **hotfix**, **les commandes de la partie [Lint](#Lint) sont obligatoires**.

### 🔴 **Si c'est le dernier commit, tous les tests doivent passer avant le push**.

---

## 🛠 **Liste des Branches** 🛠

- **`dev`** : Branche globale de développement.
- **`feature/`** : Ajout d'une nouvelle fonctionnalité (environnement de développement).
- **`issue-`** : Fix d'un bug (environnement de développement).
- **`hotfix`** : Création d'un hotfix (environnement de développement).
- **`testing`** : Environnement de tests (EVO).
- **`prod`** : Plateforme en production.

---

## 🌱 **Travailler sur une nouvelle feature** 🌱

### 1. **Création de la branche** :

Pour créer et basculer sur une nouvelle branche pour une fonctionnalité :

```bash
git branch feature/nomDeLaFeature
git switch feature/nomDeLaFeature
```

### 2. Push de la branche :

Lorsque vous avez terminé le développement de votre fonctionnalité, poussez votre branche vers le dépôt distant :

```bash
git push -u origin feature/nomDeLaFeature
```

### 3. Récupération d'une branche distante :

Pour récupérer une branche distante et vous y placer :

```bash
git fetch origin
git checkout feature/nomDeLaFeature
git pull
```

---

## 🧰 Outils de Développement 🧰
### Installation de Node.js :
Assurez-vous d'avoir une version de Node.js > v22.0.0. Téléchargez la dernière version stable depuis Node.js.

### Installation de Yarn :
Installez Yarn globalement en utilisant npm :
```bash
npm install --global yarn
```
---
## ⚙️ Gestion des Dépendances ⚙️
### 1. Installation des dépendances
#### Dépendances de développement :
```bash
yarn install --include=dev
```
#### Dépendances de production :
```bash
yarn install
```
---

## 🔄 Lancer l'environnement Docker de développement  Frontend 🔄
### Base de données et autres services :

Lancez tous les services nécessaires et le backend en utilisant Docker Compose (fichier `.dev.yml`) :
```bash
docker compose -f ./docker-compose.dev.yml up -d
```

---

## 🚀 Lancer l'environnement Docker de développement  Backend 🚀
### Base de données et autres services :

Lancez tous les services nécessaires pour le backend en utilisant Docker Compose (fichier `.dev-back.yml`) :
```bash
docker compose -f ./docker-compose.dev-back.yml up -d
```
Cela démarre les conteneurs pour la base de données et les autres services de développement.
### Lancer le serveur de développement :

Une fois les services Docker démarrés, vous pouvez lancer le serveur de développement :
```bash
yarn dev
```
---
## 🧪 Tests 🧪
### Lancer les tests

Pour exécuter les tests de votre projet, utilisez :
```bash
yarn run test
```
Cela va exécuter les tests automatisés pour vérifier que votre code fonctionne comme prévu.
---

## ⚡ Linting & Formatage du Code ⚡
###  Linting (avec ESLint)

Pour vérifier la qualité de votre code et l'adhésion aux règles ESLint, exécutez :
```bash
yarn run lint --fix
```

Cela corrigera automatiquement les erreurs de style lorsque c'est possible.
### Formatage du code (avec Prettier)

Pour formater le code selon les règles définies dans votre projet, exécutez :
```bash
yarn run format
```
## Vérification des Types (TypeScript)
Vérifier les types avec la commande suivante :
```bash
yarn run typecheck
```
---
## ⚠️ Bonnes Pratiques de Développement ⚠️

1. **Gardez votre code propre et bien formaté**. Utilisez les commandes de linting et de formatage avant de chaque push.
2. **Vérifiez les tests** avant de pousser des changements. Cela garantit que vous ne poussez que des modifications fiables et fonctionnelles.

