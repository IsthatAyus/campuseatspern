FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Install build dependencies for native modules, install packages
RUN apk add --no-cache python3 make g++ gcc musl-dev libc6-compat \
	&& npm install --no-audit --no-fund

COPY . .

FROM node:22-alpine

WORKDIR /app

# Copy node_modules and app files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

EXPOSE 5000

CMD ["npm", "run", "dev"]