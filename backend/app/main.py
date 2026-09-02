from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routes import articles
from .routes import categories
from .routes import auth
from .routes import reviewer


# ==========================================
# FASTAPI APP
# ==========================================

app = FastAPI(
    title="Article API",
    version="1.0.0"
)


# ==========================================
# DATABASE TABLES
# ==========================================

Base.metadata.create_all(bind=engine)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ==========================================
# UPLOADS / IMAGES
# ==========================================

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)


# ==========================================
# AUTH ROUTES
# ==========================================

app.include_router(
    auth.router
)


# ==========================================
# CATEGORY ROUTES
# ==========================================

app.include_router(
    categories.router
)


# ==========================================
# ARTICLE ROUTES
# ==========================================

app.include_router(
    articles.router
)


# ==========================================
# REVIEWER ROUTES
# ==========================================

app.include_router(
    reviewer.router
)


# ==========================================
# ROOT
# ==========================================

@app.get("/")
def root():

    return {
        "message": "Article API is running"
    }