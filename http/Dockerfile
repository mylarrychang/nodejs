FROM node:13
WORKDIR /home/node/http
COPY package.json /home/node/http
COPY package-lock.json /home/node/http
COPY http.mjs /home/node/http
COPY node_modules /home/node/http/node_modules
RUN npm install
CMD npm run demo