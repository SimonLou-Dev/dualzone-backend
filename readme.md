# Contribution

Installation de [node](https://nodejs.org/en/) > vv22.0.0

Installation de yarn 

````shell
npm install --global yarn
````
## Dépendances
Installation des dépendances de dev
````shell
yarn install --dev
````
Installation des dépendances prod

````shell
yarn install 
````
## Having database and other

````shell
docker compose -f .\docker-compose.dev.yml up -d
````

## Running dev server
````shell
node ace serve --hmr
````
Disponible via http://localhost:3333

## Tests
````shell
node ace test
````
## Lint & pretty
Runs ESLint
````shell
yarn run  lint
````

Run ESLint and auto-fix issues
````shell
yarn run lint -- --fix
````

Runs prettier
````shell
yarn run format
````

