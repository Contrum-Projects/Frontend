# Imagen de la tienda y el panel (Next.js standalone).
#   docker build -t cp-frontend --build-arg URL_IMAGENES=https://imagenes.ejemplo.cl .
#   docker run -p 3001:3001 -e API_URL=http://api:3000 cp-frontend

FROM node:22-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

FROM base AS dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS compilacion
# Se fijan al compilar: next/image y los metadatos los necesitan en el build
ARG URL_IMAGENES=""
ARG NEXT_PUBLIC_URL_SITIO=""
ENV URL_IMAGENES=$URL_IMAGENES NEXT_PUBLIC_URL_SITIO=$NEXT_PUBLIC_URL_SITIO
COPY --from=dependencias /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-alpine AS ejecucion
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3001 HOSTNAME=0.0.0.0
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=compilacion --chown=app:app /app/.next/standalone ./
COPY --from=compilacion --chown=app:app /app/.next/static ./.next/static
USER app
EXPOSE 3001
# API_URL se entrega al ejecutar (docker run -e / docker compose)
CMD ["node", "server.js"]
