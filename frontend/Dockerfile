FROM node:alpine as build

COPY package.json package-lock.json ./
RUN npm ci --quiet
COPY . .

CMD ["npm", "run", "dev"]