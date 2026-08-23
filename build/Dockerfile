# Build stage
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html ./
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts vitest.config.ts ./
COPY tailwind.config.js postcss.config.js eslint.config.js ./
COPY src ./src

RUN npm run test

RUN npm run build

# Final stage — serve the static dist with nginx
FROM nginx:1.27-alpine AS final

ARG BUILD_VER=dev
ARG BUILD_DATE=unknown
ARG BUILD_COMMIT=unknown

LABEL org.opencontainers.image.title="mnemonic-admin" \
    org.opencontainers.image.description="Internal web UI for browsing, searching, and importing Mnemonic patterns" \
    org.opencontainers.image.source="https://github.com/twistingmercury/mnemonic-admin" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.authors="Jeremy K. Johnson" \
    org.opencontainers.image.created="${BUILD_DATE}" \
    org.opencontainers.image.revision="${BUILD_COMMIT}" \
    org.opencontainers.image.version="${BUILD_VER}"

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
