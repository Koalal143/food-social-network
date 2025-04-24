FROM node:alpine as build

COPY package.json package.json
RUN npm install
COPY . .

CMD ["npm", "run", "dev"]