FROM node:24-slim

# Prisma's query engine needs OpenSSL, which the slim image does not include.
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only the package files first so Docker can cache the npm install layer
# and skip it when only source code changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# The generated client is not in git, so create it before compiling.
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
# Apply any new migrations on every start, then run the API.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
