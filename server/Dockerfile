FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

# Set environment variable to bind to all interfaces
ENV HOST=0.0.0.0

CMD ["npm", "start"] 