# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install nginx
RUN apk add --no-cache nginx

# Copy nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy built frontend
COPY --from=builder /app/dist /var/www/html

# Copy server
COPY --from=builder /app/server ./server
COPY --from=builder /app/server/node_modules ./server/node_modules
RUN chmod -R +x ./server/node_modules/.bin/

# Copy schema for DB init
COPY --from=builder /app/schema.sql ./schema.sql

# Expose ports
EXPOSE 3000

# Start script
COPY docker-entrypoint.sh /app-entrypoint.sh
RUN sed -i 's/\r$//' /app-entrypoint.sh && chmod +x /app-entrypoint.sh

CMD ["/app-entrypoint.sh"]
