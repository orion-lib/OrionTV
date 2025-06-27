# --- Build Stage ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and yarn.lock first to leverage Docker cache
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Compile TypeScript to JavaScript
RUN yarn build

# Prune development dependencies
RUN yarn install --production --ignore-scripts --prefer-offline


# --- Production Stage ---
FROM node:18-alpine

WORKDIR /app

# Copy production dependencies and compiled code from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copy config.json from the project root relative to the Docker build context
# IMPORTANT: When building, run `docker build -f backend/Dockerfile .` from the project root.
COPY config.json ./

# Expose the port the app runs on
EXPOSE 3001

# The command to run the application
# You can override the port using -e PORT=... in `docker run`
CMD [ "node", "dist/index.js" ]