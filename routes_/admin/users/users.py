from fastapi import APIRouter


userRouter = APIRouter()

@userRouter.get("/users")
async def get_users():
    return {"message": "List of users"}
