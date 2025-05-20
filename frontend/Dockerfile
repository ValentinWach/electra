FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a script to replace environment variables at runtime
RUN echo '#!/bin/sh\n\
envsubst < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp\n\
mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html\n\
nginx -g "daemon off;"' > /docker-entrypoint.sh && \
chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

CMD ["/docker-entrypoint.sh"] 