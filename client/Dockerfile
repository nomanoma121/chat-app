FROM node:22.12 AS builder

# Build arguments
ARG VITE_API_BASE_URL
ARG VITE_CLIENT_BASE_URL
ARG VITE_WS_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_CLIENT_BASE_URL=${VITE_CLIENT_BASE_URL}
ENV VITE_WS_BASE_URL=${VITE_WS_BASE_URL}

# Install pnpm directly to avoid corepack signature issues
RUN npm install -g pnpm@10.15.0

WORKDIR /app

COPY package.json pnpm-lock.yaml panda.config.ts react-router.config.ts ./

RUN pnpm install --frozen-lockfile

COPY . .

# Build the application
RUN pnpm build

FROM nginx:1.27.3

COPY --from=builder /app/build/client /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]
