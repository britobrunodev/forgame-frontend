FROM node:20-alpine AS builder

WORKDIR /app

ARG API_URL=/api/v1
ARG GOOGLE_CLIENT_ID=

ENV API_URL=$API_URL
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
