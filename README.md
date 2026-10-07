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
| Laya | `deepak-laya` | ghcr.io/dpksh22-art/laya:0.3.21 CPU · port 8783 · POST /v1/systemone |
| Clixad | `deepak-clixad` | ghcr.io/dpksh22-art/clixad · browser terminal (ttyd) · port 7681 |
| n8n Sandbox | `deepak-n8n-sandbox` | n8n Assistant code sandbox · port 3200 |
| DeepSeek Harness | `deepak-deepseek-harness` | ghcr.io/dpksh22-art/deepseek-harness:0.2.0-rc.2 · dsh web UI, auto sign-in behind Umbrel login · port 8792 |

OpenMAIC, God's Eye View, and Laya use prebuilt images (Umbrel cannot reliably `build:` community apps). Laya's first start may download Hugging Face checkpoints (~10 GB disk, ~8 GB RAM). OpenSEO needs a DataForSEO API key for SEO data.
