FROM node:alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --quiet

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]