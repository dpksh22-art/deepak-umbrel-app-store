# Umbrel community package — runs God's Eye View (Vite + server middleware).
# Upstream is Pinokio/dev-oriented; this uses the same npm run dev server for APIs.
FROM node:24-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ARG GEV_REF=main
RUN git clone --depth 1 --branch "${GEV_REF}" https://github.com/bilawalsidhu/gods-eye-view.git .

RUN npm ci || npm install

ENV HOST=0.0.0.0
ENV PORT=4173
EXPOSE 4173
# Dev server includes the API middleware the app needs; vite preview alone is not enough.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "4173"]
