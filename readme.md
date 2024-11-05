# /!\ Avant chaque push /!\

Surtout si c'est le dernier de votre feature & hotfix
Commandes de la partie [lint](#Lint) obligatoires
<br>
<br>
Si c'est le dernier commit tous les tests doivent passer

# Liste des branchs

- dev : branch globale de deb
- feature/ : ajout d'un élément (environnement de dev)
- issue- : fix d'un bug (environnement de dev)
- hotfix : création d'un hotfix (environnement de dev)
- testing : environnement evo
- prod : Plateforme en production

# Travailler sur une nouvelle feature

## Création de la branch

```shell
git branch feature/nomDeLaFeature
git switch feature/nomDeLaFeature
```

## Push de la branch

```shell
git push -u origin feature/nomDeLaFeature
```

## Récupération d'un branch distante

```shell
git fetch origin
git checkout feature/nomDeLaFeature
git pull
```

# Outils de devs

**Installation de [node](https://nodejs.org/en/) > vv22.0.0**

Installation de yarn

```shell
npm install --global yarn
```

## Dépendances

Installation des dépendances de dev

```shell
yarn install --include=dev
```

Installation des dépendances prod

```shell
yarn install
```

## Having database and other

```shell
docker compose -f .\docker-compose.dev.yml up -d
```

## Running dev server

```shell
node ace serve --hmr
```

Disponible via http://localhost:3333

## Tests

```shell
yarn run test
```

## Lint

Runs ESLint

```shell
yarn run lint --fix
```

Runs prettier

```shell
yarn run format
```

Typecheck

```shell
yarn run typecheck
```

**Pensez à refaire vos tests après on sait jamais**
