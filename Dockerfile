# ---- Stage 1: Install dependencies and build ----
FROM node:22-alpine AS builder

ARG NPM_REGISTRY_URL=https://registry.npmmirror.com/
ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY_URL}
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ENV NODE_ENV=production
RUN npm run build


# ---- Stage 2: Production image ----
FROM node:22-alpine AS runner

ENV NODE_ENV=production
ARG NPM_REGISTRY_URL
ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY_URL}
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./


EXPOSE 3000
CMD ["npm", "start"]
