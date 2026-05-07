from fastapi import APIRouter
from .users import userRouter

adminRouter = APIRouter()

adminRouter.include_router(userRouter, prefix="/users")