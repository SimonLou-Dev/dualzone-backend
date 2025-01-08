# Étape 1 : Construire l'application avec TypeScript
FROM node:22 AS builder

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers nécessaires
COPY ./ /app/
RUN yarn install && yarn run build

FROM builder AS clean
WORKDIR /app/build
RUN yarn install --immutable --immutable-cache --check-cache --frozen-lockfile --production

# Étape 2 : Créer une image minimale pour exécuter l'application
FROM alpine:3.20 AS final
RUN apk --no-cache add nodejs npm
RUN npm install -g typescript ts-node
# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier uniquement les fichiers nécessaires de l'étape 1
COPY --from=clean /app/build ./

# Définir la commande par défaut pour démarrer l'application
ENTRYPOINT ["node", "/app/bin/server.js"]
