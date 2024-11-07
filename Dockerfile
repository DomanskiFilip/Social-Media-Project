FROM node:23-alpine

COPY src /src/

WORKDIR /src

RUN npm install

CMD ["npm", "start"]