import socketio
import uvicorn
from fastapi import FastAPI
from routes import mainRouter

api = FastAPI()

@api.get("/ping")
async def home():
    return {"message": "Pong!"}


sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*"
)


@sio.event
async def connect(sid, environ):
    print("Connected:", sid)

@sio.event
async def disconnect(sid):
    print("Disconnected:", sid)

@sio.event
async def ping(sid):
    await sio.emit(
        "ping",
        {"reply": "Pong!"},
        to=sid
    )

api.include_router(mainRouter)

app = socketio.ASGIApp(
    socketio_server=sio,
    other_asgi_app=api
)

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )