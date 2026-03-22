import logging
import resend
from fastapi import FastAPI
from fastapi.websockets import WebSocket
from starlette.middleware.cors import CORSMiddleware

from core.config import RESEND_API_KEY
from routers import auth, memorials, payments, admin, reviews, affiliate

logging.basicConfig(level=logging.INFO)

resend.api_key = RESEND_API_KEY

app = FastAPI(title="Remember QrCode API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router)
app.include_router(memorials.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(reviews.router)
app.include_router(affiliate.router)


@app.get("/api/")
async def health_check():
    return {"status": "ok", "message": "API Remember está rodando 🚀"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    logger = logging.getLogger(__name__)
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Mensagem recebida via WebSocket: {data}")
            await websocket.send_text(f"Echo: {data}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        await websocket.close()