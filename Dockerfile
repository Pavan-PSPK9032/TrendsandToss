FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies
RUN cd backend && npm install --production

# Copy all backend source code
COPY backend/ ./backend/

# Expose port
EXPOSE 5000

# Start command
WORKDIR /app/backend
CMD ["node", "server.js"]