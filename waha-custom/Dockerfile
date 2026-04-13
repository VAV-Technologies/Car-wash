# Build custom WAHA with sendImage/sendFile/sendVoice enabled

FROM node:24-bookworm-slim AS build

RUN apt-get update && apt-get install -y git python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN corepack enable

WORKDIR /app
RUN git clone --depth 1 --branch core https://github.com/devlikeapro/waha.git .

# Patch sendImage, sendFile, sendVoice
COPY patch-media.js /tmp/patch-media.js
RUN node /tmp/patch-media.js

# Install dependencies and build
RUN yarn install
RUN yarn build

# ---- Release stage ----
FROM node:24-bookworm-slim

RUN apt-get update && apt-get install -y \
    chromium ffmpeg libvips-dev \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROMIUM_PATH=/usr/bin/chromium
ENV NODE_OPTIONS="--max-old-space-size=16384"

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/main"]
