# DeepSeek Harness (dsh) web UI for Umbrel.
# dsh itself listens on 127.0.0.1:3081; the bundled shim listens on 0.0.0.0:3080
# for Umbrel's app_proxy and handles dsh's per-process launch token.
FROM node:22-bookworm-slim

ARG DSH_VERSION=0.2.0-rc.2

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates git bash ripgrep bubblewrap python3 procps curl less \
 && rm -rf /var/lib/apt/lists/*

RUN npm install -g --omit=dev "@deepseek-ai/dsh@${DSH_VERSION}" \
 && npm cache clean --force

COPY shim/shim.js /opt/dsh-shim/shim.js
COPY shim/entrypoint.sh /usr/local/bin/dsh-umbrel-entrypoint
COPY shim/dsh-cli /usr/local/bin/dsh-cli
RUN chmod 755 /usr/local/bin/dsh-umbrel-entrypoint /usr/local/bin/dsh-cli /opt/dsh-shim/shim.js

ENV DSH_HOME=/data/dsh \
    HOME=/home/node \
    BROWSER=true \
    SHIM_PORT=3080 \
    DSH_PORT=3081

LABEL org.opencontainers.image.source="https://github.com/dpksh22-art/deepak-umbrel-app-store" \
      org.opencontainers.image.description="DeepSeek Harness (dsh) web UI packaged for Umbrel" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /workspace
EXPOSE 3080
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD sh -c 'c=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3080/); [ "$c" -ge 200 ] && [ "$c" -lt 500 ]'
ENTRYPOINT ["dsh-umbrel-entrypoint"]
