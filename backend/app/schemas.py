from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


# ==========================================
# AUTH SCHEMAS
# ==========================================

class UserRegister(BaseModel):

    name: str

    email: str

    password: str = Field(
        min_length=6,
        max_length=72
    )

    role: str = "user"


class UserResponse(BaseModel):

    id: int

    name: str

    email: str

    role: str

    model_config = ConfigDict(
        from_attributes=True
    )


class LoginResponse(BaseModel):

    access_token: str

    token_type: str

    user: UserResponse


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

    content: str

    image: str | None = None

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

    category_id: int | None = None

    subcategory_id: int | None = None


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

    status: str

    category_name: str | None = None

    created_at: datetime | None = None

    updated_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True
    )