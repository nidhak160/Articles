from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint
)

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

    # --------------------------------------
    # USER LIKES
    # --------------------------------------

    likes = relationship(
        "ArticleLike",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    # --------------------------------------
    # USER COMMENTS
    # --------------------------------------

    comments = relationship(
        "ArticleComment",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    # --------------------------------------
    # USER SHARES
    # --------------------------------------

    shares = relationship(
        "ArticleShare",
        back_populates="user",
        cascade="all, delete-orphan"
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

    # --------------------------------------
    # SUBCATEGORIES
    # --------------------------------------

    subcategories = relationship(
        "SubCategory",
        back_populates="category",
        cascade="all, delete-orphan"
    )

    # --------------------------------------
    # ARTICLES
    # --------------------------------------

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

    # --------------------------------------
    # CATEGORY
    # --------------------------------------

    category = relationship(
        "Category",
        back_populates="subcategories"
    )

    # --------------------------------------
    # ARTICLES
    # --------------------------------------

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

    # --------------------------------------
    # CATEGORY
    # --------------------------------------

    category = relationship(
        "Category",
        back_populates="articles"
    )

    # --------------------------------------
    # SUBCATEGORY
    # --------------------------------------

    subcategory = relationship(
        "SubCategory",
        back_populates="articles"
    )

    # --------------------------------------
    # LIKES
    # --------------------------------------

    likes = relationship(
        "ArticleLike",
        back_populates="article",
        cascade="all, delete-orphan"
    )

    # --------------------------------------
    # COMMENTS
    # --------------------------------------

    comments = relationship(
        "ArticleComment",
        back_populates="article",
        cascade="all, delete-orphan"
    )

    # --------------------------------------
    # SHARES
    # --------------------------------------

    shares = relationship(
        "ArticleShare",
        back_populates="article",
        cascade="all, delete-orphan"
    )


# ==========================================
# ARTICLE LIKE
# ==========================================

class ArticleLike(Base):
    __tablename__ = "article_likes"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    article_id = Column(
        Integer,
        ForeignKey(
            "articles.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # --------------------------------------
    # ARTICLE
    # --------------------------------------

    article = relationship(
        "Article",
        back_populates="likes"
    )

    # --------------------------------------
    # USER
    # --------------------------------------

    user = relationship(
        "User",
        back_populates="likes"
    )

    # --------------------------------------
    # ONE LIKE PER USER PER ARTICLE
    # --------------------------------------

    __table_args__ = (
        UniqueConstraint(
            "article_id",
            "user_id",
            name="unique_article_user_like"
        ),
    )


# ==========================================
# ARTICLE COMMENT
# ==========================================

class ArticleComment(Base):
    __tablename__ = "article_comments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    article_id = Column(
        Integer,
        ForeignKey(
            "articles.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    comment = Column(
        Text,
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

    # --------------------------------------
    # ARTICLE
    # --------------------------------------

    article = relationship(
        "Article",
        back_populates="comments"
    )

    # --------------------------------------
    # USER
    # --------------------------------------

    user = relationship(
        "User",
        back_populates="comments"
    )


# ==========================================
# ARTICLE SHARE
# ==========================================

class ArticleShare(Base):
    __tablename__ = "article_shares"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    article_id = Column(
        Integer,
        ForeignKey(
            "articles.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # --------------------------------------
    # ARTICLE
    # --------------------------------------

    article = relationship(
        "Article",
        back_populates="shares"
    )

    # --------------------------------------
    # USER
    # --------------------------------------

    user = relationship(
        "User",
        back_populates="shares"
    )