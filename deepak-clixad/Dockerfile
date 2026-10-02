# Umbrel community package: Clixad (terminal AI coding agent) in a browser
# terminal via ttyd. Built by GitHub Actions → ghcr.io/dpksh22-art/clixad.
# Upstream: https://github.com/FlosGit/Clixad (npm: clixad, Node 20+)
FROM node:22-bookworm-slim

ARG CLIXAD_VERSION=0.0.1-beta.24
ARG TTYD_VERSION=1.7.7
ARG TARGETARCH

ENV DEBIAN_FRONTEND=noninteractive \
    TERM=xterm-256color \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      git curl ca-certificates nano python3 less openssh-client procps \
 && rm -rf /var/lib/apt/lists/*

# ttyd static binary from GitHub releases
RUN set -eux; \
    case "${TARGETARCH:-amd64}" in \
      amd64) TTYD_ARCH=x86_64 ;; \
      arm64) TTYD_ARCH=aarch64 ;; \
      *) echo "unsupported arch ${TARGETARCH}"; exit 1 ;; \
    esac; \
    curl -fsSL -o /usr/local/bin/ttyd \
      "https://github.com/tsl0922/ttyd/releases/download/${TTYD_VERSION}/ttyd.${TTYD_ARCH}"; \
    chmod +x /usr/local/bin/ttyd; \
    ttyd --version

RUN npm i -g "clixad@${CLIXAD_VERSION}" \
 && npm cache clean --force \
 && clixad --version

COPY motd.sh /etc/profile.d/zz-clixad-motd.sh
RUN chmod 644 /etc/profile.d/zz-clixad-motd.sh \
 && mkdir -p /workspace \
 && git config --system init.defaultBranch main \
 && git config --system --add safe.directory '*'

WORKDIR /workspace
EXPOSE 7681

# Writable browser terminal → bash login shell in /workspace
CMD ["ttyd", "-W", "-p", "7681", "-w", "/workspace", "-t", "titleFixed=Clixad", "bash", "-l"]
