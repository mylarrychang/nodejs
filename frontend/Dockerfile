FROM node:16 as base
WORKDIR /home/node/frontend
COPY package.json /home/node/frontend
COPY frontend.mjs /home/node/frontend
COPY html /home/node/frontend/html
EXPOSE 8080
RUN npm install
CMD npm run frontend

FROM base as dev
RUN wget -O /bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
RUN chmod +x /bin/wait-for-it.sh
