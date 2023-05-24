FROM node:16
WORKDIR /home/node/frontend
COPY package.json /home/node/frontend
COPY package-lock.json /home/node/frontend
COPY frontend.mjs /home/node/frontend
COPY html /home/node/frontend/html
COPY node_modules /home/node/frontend/node_modules
EXPOSE 8080
RUN npm install
CMD npm run frontend