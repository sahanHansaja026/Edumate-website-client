# 1. Base image
FROM node:20-alpine

# 2. Set working directory
WORKDIR /app

# 3. Install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy all files
COPY . .

# 5. Build Next.js app
RUN npm run build

# 6. Expose port
EXPOSE 3000

# 7. Start app
CMD ["npm", "run", "start"]