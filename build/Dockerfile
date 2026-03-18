# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package.json package-lock.json ./

RUN npm ci

# Copy source files needed by the Vite + TypeScript build
COPY index.html ./
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts ./
COPY tailwind.config.js postcss.config.js eslint.config.js ./
COPY src ./src

RUN npm run build

# Runner stage — serve the static dist with nginx
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
