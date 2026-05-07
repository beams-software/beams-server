from fastapi import APIRouter
from .admin import adminRouter

mainRouter = APIRouter()
mainRouter.include_router(adminRouter, prefix="/admin", tags=["Admin"])
