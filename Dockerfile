# ---------- Stage 1: Build Angular App ----------
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build Angular app (change project name if needed)
RUN npm run build -- --configuration production


# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*


# Copy build output to nginx folder

# Copy browser build output to nginx folder (some builds place files under `browser/`)
COPY --from=build /app/dist/volunteer-system/browser/ /usr/share/nginx/html/

# Ensure nginx can read the files
RUN chmod -R 755 /usr/share/nginx/html

# Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
