FROM nginx:alpine

# Patch OS vulnerabilities
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
