# ── Stage 1: build frontend ───────────────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ .
RUN npm run build
# output: /app/frontend/dist

# ── Stage 2: backend Node.js + frontend estático ──────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Instala dependências do backend (apenas produção)
COPY backend-node/package*.json ./backend-node/
WORKDIR /app/backend-node
RUN npm install --omit=dev

# Copia código-fonte do backend
COPY backend-node/ ./

# Gera o Prisma Client (não precisa de banco em tempo de build)
RUN npx prisma generate

# Copia o build do React para o lugar que o Express serve
WORKDIR /app
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 8080

WORKDIR /app/backend-node
# prisma db push sincroniza o schema (substitui o ddl-auto=update do Java)
# depois sobe o servidor Express
CMD ["sh", "-c", "npx prisma db push && node src/index.js"]
