# Deepak Community App Store (Umbrel)

Community app store for umbrelOS. Add this repository URL in umbrelOS → App Store → Community App Stores:

https://github.com/dpksh22-art/deepak-umbrel-app-store

## Apps

| App | Id | Notes |
| --- | --- | --- |
| Blender | `deepak-blender` | linuxserver/blender 4.4.3 (HTTP) |
| Brave | `deepak-brave` | linuxserver/brave (Selkies) · port 8791 |
| OmniRoute | `deepak-omniroute` | diegosouzapw/omniroute 3.8.50 · port 20129 |
| OpenMAIC | `deepak-openmaic` | Prebuilt community image · port 8780 |
| OpenSEO | `deepak-openseo` | ghcr.io/every-app/open-seo · port 8781 |
| God's Eye View | `deepak-gods-eye-view` | Prebuilt community image · port 8782 |
| Laya | `deepak-laya` | laya-serve 0.3.21 CPU (build on install) · port 8783 · POST /v1/systemone |
| n8n Sandbox | `deepak-n8n-sandbox` | n8n Assistant code sandbox · port 3200 |

OpenMAIC and God's Eye View use prebuilt Hub images. Laya builds from a local Dockerfile on first install (PyTorch CPU + `laya[serve]`); allow several minutes and ~10 GB disk for checkpoints. OpenSEO needs a DataForSEO API key for SEO data.
