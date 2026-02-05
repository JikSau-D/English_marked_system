from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.auth import router as auth_router
from app.routers.essays import router as essays_router
from app.routers.evaluate import router as evaluate_router


def create_app() -> FastAPI:
    app = FastAPI(title=settings.PROJECT_NAME)

    origins = [o.strip() for o in settings.BACKEND_CORS_ORIGINS.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(auth_router, prefix=settings.API_V1_STR)
    app.include_router(evaluate_router, prefix=settings.API_V1_STR)
    app.include_router(essays_router, prefix=settings.API_V1_STR)
    return app


app = create_app()
