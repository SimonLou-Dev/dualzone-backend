# Étape 1 : Construire l'application avec TypeScript
FROM node:22 AS builder

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers nécessaires
COPY ./ /app/
RUN npm install && npm run build

FROM builder AS clean
WORKDIR /app
RUN npm ci

# Étape 2 : Créer une image minimale pour exécuter l'application
FROM alpine:3.20 AS final
RUN apk --no-cache add nodejs
# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier uniquement les fichiers nécessaires de l'étape 1
COPY --from=clean /app/ ./

# Définir la commande par défaut pour démarrer l'application
CMD ["node", "dist/app.js"]
