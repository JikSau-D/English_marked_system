#!/usr/bin/env bash
set -euo pipefail

if [ ! -f ".env" ]; then
  echo "[start] .env not found; creating from .env.example"
  cp .env .env
  echo "[start] Please edit .env and set BAIDU_OCR_* and DEEPSEEK_API_KEY before running again."
  exit 1
fi

docker compose up --build

