import os
from datetime import datetime
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Article, Category, SubCategory
from ..schemas import ArticleResponse


router = APIRouter(
    prefix="/articles",
    tags=["Articles"]
)


# ==========================================
# UPLOAD FOLDER
# ==========================================

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# ==========================================
# CREATE ARTICLE
# ==========================================

@router.post(
    "/",
    response_model=ArticleResponse
)
async def create_article(

    title: str = Form(...),

    short_description: str = Form(...),

    # FULL ARTICLE CONTENT
    content: str = Form(...),

    author: str = Form(...),

    published_date: str | None = Form(None),

    category_id: int = Form(...),

    subcategory_id: int | None = Form(None),

    image: UploadFile | None = File(None),

    db: Session = Depends(get_db)
):

    # ======================================
    # CHECK CATEGORY
    # ======================================

    category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not category:

        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )


    # ======================================
    # CHECK SUBCATEGORY
    # ======================================

    subcategory = None

    if subcategory_id is not None:

        subcategory = db.query(SubCategory).filter(
            SubCategory.id == subcategory_id
        ).first()

        if not subcategory:

            raise HTTPException(
                status_code=404,
                detail="Subcategory not found"
            )

        if subcategory.category_id != category_id:

            raise HTTPException(
                status_code=400,
                detail="Subcategory does not belong to this category"
            )


    # ======================================
    # IMAGE
    # ======================================

    image_path = None

    if image:

        allowed_types = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ]

        if image.content_type not in allowed_types:

            raise HTTPException(
                status_code=400,
                detail="Only JPG, PNG and WEBP images are allowed"
            )

        contents = await image.read()

        if len(contents) > 5 * 1024 * 1024:

            raise HTTPException(
                status_code=400,
                detail="Image must be less than 5MB"
            )

        extension = os.path.splitext(
            image.filename
        )[1].lower()

        filename = f"{uuid4().hex}{extension}"

        file_path = os.path.join(
            UPLOAD_DIR,
            filename
        )

        with open(
            file_path,
            "wb"
        ) as buffer:

            buffer.write(contents)

        image_path = f"/uploads/{filename}"


    # ======================================
    # DATE
    # ======================================

    parsed_date = None

    if published_date:

        try:

            parsed_date = datetime.fromisoformat(
                published_date
            )

        except ValueError:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid published date. "
                    "Use YYYY-MM-DD or "
                    "YYYY-MM-DDTHH:MM:SS"
                )
            )


    # ======================================
    # CREATE ARTICLE
    # ======================================

    article = Article(

        title=title,

        short_description=short_description,

        # FULL CONTENT
        content=content,

        image=image_path,

        author=author,

        published_date=parsed_date,

        category_id=category_id,

        subcategory_id=subcategory_id
    )


    db.add(article)

    db.commit()

    db.refresh(article)

    return article


# ==========================================
# GET ALL ARTICLES
# ==========================================

@router.get(
    "/",
    response_model=list[ArticleResponse]
)
def get_articles(
    db: Session = Depends(get_db)
):

    return db.query(Article).all()


# ==========================================
# GET ARTICLES BY CATEGORY
# ==========================================

@router.get(
    "/category/{category_id}",
    response_model=list[ArticleResponse]
)
def get_articles_by_category(
    category_id: int,
    db: Session = Depends(get_db)
):

    category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not category:

        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    articles = db.query(Article).filter(
        Article.category_id == category_id
    ).all()

    return articles


# ==========================================
# GET ARTICLES BY SUBCATEGORY
# ==========================================

@router.get(
    "/subcategory/{subcategory_id}",
    response_model=list[ArticleResponse]
)
def get_articles_by_subcategory(
    subcategory_id: int,
    db: Session = Depends(get_db)
):

    subcategory = db.query(SubCategory).filter(
        SubCategory.id == subcategory_id
    ).first()

    if not subcategory:

        raise HTTPException(
            status_code=404,
            detail="Subcategory not found"
        )

    articles = db.query(Article).filter(
        Article.subcategory_id == subcategory_id
    ).all()

    return articles


# ==========================================
# GET SINGLE ARTICLE
# ==========================================

@router.get(
    "/{article_id}",
    response_model=ArticleResponse
)
def get_article(
    article_id: int,
    db: Session = Depends(get_db)
):

    article = db.query(Article).filter(
        Article.id == article_id
    ).first()

    if not article:

        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )

    return article


# ==========================================
# DELETE ARTICLE
# ==========================================

@router.delete(
    "/{article_id}"
)
def delete_article(
    article_id: int,
    db: Session = Depends(get_db)
):

    article = db.query(Article).filter(
        Article.id == article_id
    ).first()

    if not article:

        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )


    # ======================================
    # DELETE IMAGE
    # ======================================

    if article.image:

        filename = os.path.basename(
            article.image
        )

        file_path = os.path.join(
            UPLOAD_DIR,
            filename
        )

        if os.path.exists(file_path):

            os.remove(file_path)


    # ======================================
    # DELETE ARTICLE
    # ======================================

    db.delete(article)

    db.commit()

    return {
        "message": "Article deleted successfully"
    }