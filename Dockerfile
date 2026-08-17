# =========================================================
# Stage 1 — Build the React app with Vite
# =========================================================
FROM node:20-alpine AS build

WORKDIR /app

# Install deps first (better layer caching: only re-runs npm ci
# when package*.json actually change, not on every source edit)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build the production bundle
COPY . .
RUN npm run build


# =========================================================
# Stage 2 — Serve the static build with nginx
# =========================================================
FROM nginx:1.27-alpine AS production

# Custom nginx config (SPA-friendly: falls back to index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy only the compiled static assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
