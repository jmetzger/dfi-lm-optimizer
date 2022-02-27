FROM node:current-alpine
WORKDIR /usr/src/app
COPY src/ .
RUN npm install
CMD ["node","--openssl-legacy-provider","app.js"]
