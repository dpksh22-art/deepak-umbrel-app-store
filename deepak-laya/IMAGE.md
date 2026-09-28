# Laya CPU image (GHCR)

Umbrel cannot `build:` this package (compose merge uses `docker-compose.common.yml`
first without `--project-directory`, so Dockerfile is never found). Compose pulls:

`ghcr.io/dpksh22-art/laya:0.3.21`

## Publish the image

1. Copy `build-laya.workflow.yml` → `.github/workflows/build-laya.yml` in this repo
   (needs a GitHub token with `workflow` scope), **or** paste that file in the
   GitHub UI under Actions → new workflow.
2. Ensure Actions can write packages (`packages: write`). Repo `GITHUB_TOKEN` is
   enough once the workflow file exists under `.github/workflows/`.
3. Run the workflow (push to `deepak-laya/Dockerfile` or Actions → Run workflow).
4. After the first push, set package visibility to **Public** on
   https://github.com/users/dpksh22-art/packages/container/package/laya
   so Umbrel can pull without auth (workflow tries this automatically).

Alternative: on a machine with Docker (e.g. Asus Docker Desktop):

```bash
cd deepak-laya
docker build -t ghcr.io/dpksh22-art/laya:0.3.21 .
echo $GHCR_TOKEN | docker login ghcr.io -u dpksh22-art --password-stdin
docker push ghcr.io/dpksh22-art/laya:0.3.21
docker tag ghcr.io/dpksh22-art/laya:0.3.21 ghcr.io/dpksh22-art/laya:latest
docker push ghcr.io/dpksh22-art/laya:latest
```

Do **not** retry Umbrel install until `docker pull ghcr.io/dpksh22-art/laya:0.3.21` works anonymously.


## Umbrel volume permissions

Umbrel mounts `${APP_DATA_DIR}/model-cache` owned by root (or uid 1000). The
image USER is uid 10001 (`laya`), which cannot write that mount and crashes on
`LAYA_PRELOAD` with `PermissionError` under `/home/laya/.cache/huggingface/hub`.

`docker-compose.yml` sets `user: "0:0"` for this home-lab package so preload can
populate the cache. Documented in umbrel-app.yml release notes (0.3.21-r1).
