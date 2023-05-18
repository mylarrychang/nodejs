FROM node:16
WORKDIR /home/node/http
COPY package.json /home/node/http
COPY package-lock.json /home/node/http
COPY http.mjs /home/node/http
COPY html /home/node/http/html
COPY node_modules /home/node/http/node_modules
EXPOSE 8080
RUN npm install
CMD npm run demo