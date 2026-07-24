# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the app
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install serve to serve the static build
RUN npm install -g serve

# Copy the built app from builder stage
COPY --from=builder /app/build ./build

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]
