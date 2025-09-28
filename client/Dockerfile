FROM node:22.12 AS builder

# Build arguments
ARG VITE_API_BASE_URL
ARG VITE_CLIENT_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_CLIENT_BASE_URL=${VITE_CLIENT_BASE_URL}

# Enable corepack for pnpm
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM nginx:1.27.3

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]