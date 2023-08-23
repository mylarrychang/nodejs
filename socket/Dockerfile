FROM node:16
WORKDIR /home/node/web
COPY package.json /home/node/web
COPY socket.mjs /home/node/web
RUN npm install
CMD npm run demo