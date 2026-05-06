import socketio
import uvicorn
from fastapi import FastAPI

app = FastAPI()

@app.get("/ping")
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
    print("Message:")

    await sio.emit(
        "ping",
        {"reply": "Pong!"},
        to=sid
    )

app = socketio.ASGIApp(
    socketio_server=sio,
    other_asgi_app=app
)

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )