FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
# Ensure inventory directory is lowercase (Windows may preserve wrong casing)
RUN if [ -d "src/Inventory" ] && [ ! -d "src/inventory" ]; then mv src/Inventory src/inventory; fi
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3001
CMD ["node", "dist/main"]
