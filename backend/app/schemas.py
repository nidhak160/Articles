from datetime import datetime
from pydantic import BaseModel, ConfigDict


# ==========================================
# SUBCATEGORY SCHEMAS
# ==========================================

class SubCategoryCreate(BaseModel):
    name: str
    category_id: int


class SubCategoryResponse(BaseModel):
    id: int
    name: str
    category_id: int

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================
# CATEGORY SCHEMAS
# ==========================================

class CategoryCreate(BaseModel):
    name: str


class CategoryResponse(BaseModel):
    id: int
    name: str
    subcategories: list[SubCategoryResponse] = []

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================
# ARTICLE CREATE
# ==========================================

class ArticleCreate(BaseModel):
    title: str
    short_description: str
    content: str | None = None
    image: str | None = None
    author: str
    published_date: datetime | None = None
    category_id: int
    subcategory_id: int | None = None


# ==========================================
# ARTICLE UPDATE
# ==========================================

class ArticleUpdate(BaseModel):
    title: str | None = None
    short_description: str | None = None
    content: str | None = None
    image: str | None = None
    author: str | None = None
    published_date: datetime | None = None
    category_id: int | None = None
    subcategory_id: int | None = None
    status: str | None = None


# ==========================================
# ARTICLE RESPONSE
# ==========================================

class ArticleResponse(BaseModel):
    id: int
    title: str
    short_description: str
    content: str
    image: str | None = None
    author: str
    published_date: datetime | None = None
    category_id: int
    subcategory_id: int 
    status: str

    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True
    )