# 1. Use a full Node image instead of alpine for Playwright support
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. VITAL: Install Playwright browsers and system dependencies inside the container
RUN npx playwright install --with-deps chromium

# 6. Copy the rest of the code
COPY . .

# 7. Build the NestJS app
RUN npm run build

# 8. Expose port and start
EXPOSE 3000
CMD ["npm", "run", "start:prod"]