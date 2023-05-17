FROM node:12
WORKDIR /home/node/web
COPY package.json /home/node/web
COPY package-lock.json /home/node/web
COPY socket.mjs /home/node/web
COPY node_modules /home/node/web/node_modules
RUN npm install
CMD npm run demo