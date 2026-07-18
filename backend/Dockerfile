FROM node:20-slim
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . /app
COPY prisma/migrations /app/prisma/migrations
RUN npm install
EXPOSE 4000
CMD ["node", "server.js"]