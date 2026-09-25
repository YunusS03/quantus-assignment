FROM node:24-slim

WORKDIR /app

# Copy only the package files first so Docker can cache the npm install layer
# and skip it when only source code changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main"]
