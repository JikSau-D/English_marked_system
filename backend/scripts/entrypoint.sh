#!/usr/bin/env bash
set -euo pipefail

mkdir -p "${UPLOAD_DIR:-uploads}"

echo "[backend] Waiting for database..."
python - <<'PY'
import os
import sys
import time

from sqlalchemy import create_engine

url = os.environ.get("DATABASE_URL")
if not url:
    print("DATABASE_URL is not set", file=sys.stderr)
    sys.exit(1)

engine = create_engine(url, pool_pre_ping=True)

for i in range(30):
    try:
        with engine.connect() as conn:
            conn.exec_driver_sql("SELECT 1")
        print("[backend] Database is ready")
        break
    except Exception as e:  # noqa: BLE001
        print(f"[backend] DB not ready ({i+1}/30): {e}")
        time.sleep(1)
else:
    print("[backend] Database did not become ready in time", file=sys.stderr)
    sys.exit(1)
PY

echo "[backend] Running migrations..."
alembic upgrade head

echo "[backend] Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
