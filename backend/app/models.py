from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


# ==========================================
# USER
# ==========================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(150),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    password = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(30),
        nullable=False,
        default="user"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

# ==========================================
# CATEGORY
# ==========================================

class Category(Base):
    __tablename__ = "categories"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        unique=True,
        nullable=False
    )

    subcategories = relationship(
        "SubCategory",
        back_populates="category",
        cascade="all, delete-orphan"
    )

    articles = relationship(
        "Article",
        back_populates="category"
    )


# ==========================================
# SUBCATEGORY
# ==========================================

class SubCategory(Base):
    __tablename__ = "subcategories"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=False
    )

    category = relationship(
        "Category",
        back_populates="subcategories"
    )

    articles = relationship(
        "Article",
        back_populates="subcategory"
    )


# ==========================================
# ARTICLE
# ==========================================

class Article(Base):
    __tablename__ = "articles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(255),
        nullable=False
    )

    short_description = Column(
        Text,
        nullable=False
    )

    content = Column(
        Text,
        nullable=False
    )

    image = Column(
        String(500),
        nullable=True
    )

    author = Column(
        String(150),
        nullable=False
    )

    published_date = Column(
        DateTime,
        default=datetime.utcnow
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=False
    )

    subcategory_id = Column(
        Integer,
        ForeignKey("subcategories.id"),
        nullable=True
    )

    status = Column(
        String(30),
        default="draft",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    category = relationship(
        "Category",
        back_populates="articles"
    )

    subcategory = relationship(
        "SubCategory",
        back_populates="articles"
    )