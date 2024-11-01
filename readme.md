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
## Running dev server
````shell
node ace serve --hmr
````
Disponible via http://localhost:3000

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

