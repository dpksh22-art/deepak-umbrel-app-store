# Umbrel community package — builds OpenMAIC from the upstream release tag.
FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git ca-certificates python3 build-essential \
    libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ARG OPENMAIC_REF=v1.0.3
RUN git clone --depth 1 --branch "${OPENMAIC_REF}" https://github.com/THU-MAIC/OpenMAIC.git .

RUN corepack enable && corepack prepare pnpm@10.28.0 --activate \
  && pnpm install --frozen-lockfile \
  && pnpm build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["pnpm", "start"]
