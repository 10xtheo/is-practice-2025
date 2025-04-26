from fastapi import FastAPI
from typing import Callable, Dict
from fastapi import WebSocket

routes: Dict[str, Callable[[WebSocket], None]] = {}

def websocket_route(path: str):
    def decorator(func: Callable[[WebSocket], None]):
        routes[path] = func
        return func
    return decorator

def register_websocket_routes(app: FastAPI):
    for path, handler in routes.items():
        app.add_api_websocket_route(path, handler)
