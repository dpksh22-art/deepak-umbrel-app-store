# Umbrel community package: CPU laya-serve (Jev-compatible POST /v1/systemone).
# Built from PyPI by GitHub Actions → ghcr.io/dpksh22-art/laya (no GPU).
# First container start downloads checkpoints from Hugging Face.
# Upstream: https://github.com/NandhaKishorM/laya (docs/docker.md)
FROM python:3.11-slim-bookworm

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PATH="/opt/venv/bin:$PATH" \
    TORCH_DISABLE_NATIVE_JIT=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    USE_TF=0 \
    USE_TORCH=1 \
    TOKENIZERS_PARALLELISM=false \
    OMP_NUM_THREADS=4 \
    LAYA_DEVICE=cpu \
    LAYA_HOST=0.0.0.0 \
    LAYA_PORT=8000 \
    HF_HOME=/home/laya/.cache/huggingface

RUN python -m venv /opt/venv

# CPU PyTorch (pin matches upstream Docker quickstart), then laya[serve].
ARG TORCH_VERSION=2.14.0
ARG LAYA_VERSION=0.3.21
RUN pip install "torch==${TORCH_VERSION}" --index-url https://download.pytorch.org/whl/cpu \
 && pip install "laya[serve]==${LAYA_VERSION}" \
 && pip check

RUN groupadd --gid 10001 laya \
 && useradd --uid 10001 --gid laya --create-home laya \
 && mkdir -p /home/laya/.cache/huggingface \
 && chown -R laya:laya /home/laya

USER laya
WORKDIR /home/laya
EXPOSE 8000

# Health: GET /health (no auth). API: POST /v1/systemone
CMD ["laya-serve"]
