import os
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
from pydantic import BaseModel
from ..database import get_db
from ..models import Article, ArticleComment, ArticleLike, ArticleShare, Category, SubCategory, User
from ..schemas import ArticleResponse, CommentCreate
from .auth import require_role


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
# AUTHOR ONLY
# ==========================================

@router.post(
    "/",
    response_model=ArticleResponse
)
async def create_article(

    title: str = Form(...),

    short_description: str = Form(...),

    content: str = Form(...),

    category_id: int = Form(...),

    subcategory_id: int | None = Form(None),

    image: UploadFile | None = File(None),

    current_user: User = Depends(
        require_role("author")
    ),

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
    # IMAGE UPLOAD
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
    # CREATE DRAFT
    # ======================================

    article = Article(

        title=title,

        short_description=short_description,

        content=content,

        image=image_path,

        # AUTHOR COMES FROM LOGIN
        author=current_user.name,

        # DRAFT DOES NOT PUBLISH
        published_date=None,

        category_id=category_id,

        subcategory_id=subcategory_id,

        status="draft"
    )


    db.add(article)

    db.commit()

    db.refresh(article)

    return article


# ==========================================
# GET ALL PUBLISHED ARTICLES
# PUBLIC
# NO LOGIN REQUIRED
# ==========================================

@router.get(
    "/",
    response_model=list[ArticleResponse]
)
def get_articles(
    db: Session = Depends(get_db)
):

    articles = db.query(Article).filter(
        Article.status == "published"
    ).order_by(
        Article.created_at.desc()
    ).all()

    return articles


# ==========================================
# GET MY ARTICLES
# AUTHOR ONLY
# ==========================================

@router.get(
    "/my/articles",
    response_model=list[ArticleResponse]
)
def get_my_articles(

    current_user: User = Depends(
        require_role("author")
    ),

    db: Session = Depends(get_db)
):

    articles = db.query(Article).filter(
        Article.author == current_user.name
    ).order_by(
        Article.created_at.desc()
    ).all()

    result = []

    for article in articles:

        result.append({
            "id": article.id,
            "title": article.title,
            "short_description": article.short_description,
            "content": article.content,
            "image": article.image,
            "author": article.author,
            "published_date": article.published_date,
            "status": article.status,

            "category_id": article.category_id,
            "subcategory_id": article.subcategory_id,

            "category_name": (
                article.category.name
                if article.category
                else None
            ),

        })

    return result


# ==========================================
# GET ARTICLES BY CATEGORY
# PUBLIC
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
        Article.category_id == category_id,
        Article.status == "published"
    ).order_by(
        Article.created_at.desc()
    ).all()

    return articles


# ==========================================
# GET ARTICLES BY SUBCATEGORY
# PUBLIC
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
        Article.subcategory_id == subcategory_id,
        Article.status == "published"
    ).order_by(
        Article.created_at.desc()
    ).all()

    return articles


# ==========================================
# GET SINGLE ARTICLE
# PUBLIC
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
        Article.id == article_id,
        Article.status == "published"
    ).first()

    if not article:

        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )

    return article


# ==========================================
# UPDATE ARTICLE
# AUTHOR ONLY
# DRAFT / REJECTED ONLY
# ==========================================

@router.put(
    "/{article_id}",
    response_model=ArticleResponse
)
async def update_article(

    article_id: int,

    title: str = Form(...),

    short_description: str = Form(...),

    content: str = Form(...),

    category_id: int = Form(...),

    subcategory_id: int | None = Form(None),

    image: UploadFile | None = File(None),

    current_user: User = Depends(
        require_role("author")
    ),

    db: Session = Depends(get_db)
):

    # ======================================
    # FIND ARTICLE
    # ======================================

    article = db.query(Article).filter(
        Article.id == article_id
    ).first()

    if not article:

        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )


    # ======================================
    # CHECK OWNER
    # ======================================

    if article.author != current_user.name:

        raise HTTPException(
            status_code=403,
            detail="You can only edit your own articles"
        )


    # ======================================
    # CHECK STATUS
    # ======================================

    if article.status not in [
        "draft",
        "rejected"
    ]:

        raise HTTPException(
            status_code=400,
            detail="Only draft or rejected articles can be edited"
        )


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
    # UPDATE IMAGE
    # ======================================

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

        # Delete old image
        if article.image:

            old_filename = os.path.basename(
                article.image
            )

            old_path = os.path.join(
                UPLOAD_DIR,
                old_filename
            )

            if os.path.exists(old_path):

                os.remove(old_path)


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

        article.image = f"/uploads/{filename}"


    # ======================================
    # UPDATE DATA
    # ======================================

    article.title = title

    article.short_description = short_description

    article.content = content

    article.category_id = category_id

    article.subcategory_id = subcategory_id

    # Rejected article becomes draft again
    article.status = "draft"

    db.commit()

    db.refresh(article)

    return article


# ==========================================
# SUBMIT FOR REVIEW
# AUTHOR ONLY
# ==========================================

@router.put(
    "/{article_id}/submit",
    response_model=ArticleResponse
)
def submit_article(

    article_id: int,

    current_user: User = Depends(
        require_role("author")
    ),

    db: Session = Depends(get_db)
):

    # ======================================
    # FIND ARTICLE
    # ======================================

    article = db.query(Article).filter(
        Article.id == article_id
    ).first()

    if not article:

        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )


    # ======================================
    # CHECK OWNER
    # ======================================

    if article.author != current_user.name:

        raise HTTPException(
            status_code=403,
            detail="You can only submit your own articles"
        )


    # ======================================
    # CHECK STATUS
    # ======================================

    if article.status not in [
        "draft",
        "rejected"
    ]:

        raise HTTPException(
            status_code=400,
            detail="Only draft or rejected articles can be submitted"
        )


    # ======================================
    # VALIDATE CONTENT
    # ======================================

    if not article.title.strip():

        raise HTTPException(
            status_code=400,
            detail="Article title is required"
        )

    if not article.short_description.strip():

        raise HTTPException(
            status_code=400,
            detail="Short description is required"
        )

    if not article.content.strip():

        raise HTTPException(
            status_code=400,
            detail="Article content is required"
        )


    # ======================================
    # SUBMIT
    # ======================================

    article.status = "pending_review"

    db.commit()

    db.refresh(article)

    return article


# ==========================================
# DELETE ARTICLE
# AUTHOR ONLY
# ==========================================

@router.delete(
    "/{article_id}"
)
def delete_article(

    article_id: int,

    current_user: User = Depends(
        require_role("author")
    ),

    db: Session = Depends(get_db)
):

    # ======================================
    # FIND ARTICLE
    # ======================================

    article = db.query(Article).filter(
        Article.id == article_id
    ).first()

    if not article:

        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )


    # ======================================
    # CHECK OWNER
    # ======================================

    if article.author != current_user.name:

        raise HTTPException(
            status_code=403,
            detail="You can only delete your own articles"
        )


    # ======================================
    # CHECK STATUS
    # ======================================

    if article.status not in [
        "draft",
        "rejected"
    ]:

        raise HTTPException(
            status_code=400,
            detail="Only draft or rejected articles can be deleted"
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

# ==========================================
# LIKE / UNLIKE ARTICLE
# LOGIN REQUIRED
# USER / AUTHOR / REVIEWER
# ==========================================

@router.post("/{article_id}/like")
def like_article(
    article_id: int,
    current_user: User = Depends(require_role("user", "author", "reviewer")),
    db: Session = Depends(get_db)
):
    # Find article
    article = (
        db.query(Article)
        .filter(
            Article.id == article_id,
            Article.status == "published"
        )
        .first()
    )

    if not article:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )

    # Check existing like
    existing_like = (
        db.query(ArticleLike)
        .filter(
            ArticleLike.article_id == article_id,
            ArticleLike.user_id == current_user.id
        )
        .first()
    )

    # If already liked → unlike
    if existing_like:

        db.delete(existing_like)
        db.commit()

        liked = False

    # Otherwise → like
    else:

        new_like = ArticleLike(
            article_id=article_id,
            user_id=current_user.id
        )

        db.add(new_like)
        db.commit()

        liked = True

    # Get updated count
    like_count = (
        db.query(ArticleLike)
        .filter(
            ArticleLike.article_id == article_id
        )
        .count()
    )

    return {
        "liked": liked,
        "like_count": like_count
    }    

# ==========================================
# GET LIKE STATUS
# LOGIN REQUIRED
# ==========================================

@router.get("/{article_id}/like")
def get_like_status(
    article_id: int,
    current_user: User = Depends(require_role("user", "author", "reviewer")),
    db: Session = Depends(get_db)
):

    article = (
        db.query(Article)
        .filter(Article.id == article_id)
        .first()
    )

    if not article:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )

    existing_like = (
        db.query(ArticleLike)
        .filter(
            ArticleLike.article_id == article_id,
            ArticleLike.user_id == current_user.id
        )
        .first()
    )

    like_count = (
        db.query(ArticleLike)
        .filter(
            ArticleLike.article_id == article_id
        )
        .count()
    )

    return {
        "liked": existing_like is not None,
        "like_count": like_count
    }    
# ==========================================
# ADD COMMENT
# LOGIN REQUIRED
# USER / AUTHOR / REVIEWER
# ==========================================

@router.post("/{article_id}/comments")
def add_comment(
    article_id: int,
    data: CommentCreate,
    current_user: User = Depends(
        require_role("user", "author", "reviewer")
    ),
    db: Session = Depends(get_db)
):

    # --------------------------------------
    # CHECK ARTICLE
    # --------------------------------------

    article = (
        db.query(Article)
        .filter(
            Article.id == article_id,
            Article.status == "published"
        )
        .first()
    )

    if not article:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )

    # --------------------------------------
    # CHECK COMMENT
    # --------------------------------------

    if not data.comment.strip():
        raise HTTPException(
            status_code=400,
            detail="Comment cannot be empty"
        )

    # --------------------------------------
    # CREATE COMMENT
    # --------------------------------------

    new_comment = ArticleComment(
        article_id=article_id,
        user_id=current_user.id,
        comment=data.comment.strip()
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return {
        "id": new_comment.id,
        "article_id": new_comment.article_id,
        "user_id": new_comment.user_id,
        "user_name": current_user.name,
        "comment": new_comment.comment,
        "created_at": new_comment.created_at
    }


# ==========================================
# GET ARTICLE COMMENTS
# PUBLIC
# NO LOGIN REQUIRED
# ==========================================

@router.get("/{article_id}/comments")
def get_article_comments(
    article_id: int,
    db: Session = Depends(get_db)
):

    # --------------------------------------
    # CHECK ARTICLE
    # --------------------------------------

    article = (
        db.query(Article)
        .filter(
            Article.id == article_id,
            Article.status == "published"
        )
        .first()
    )

    if not article:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )

    # --------------------------------------
    # GET COMMENTS
    # --------------------------------------

    comments = (
        db.query(ArticleComment)
        .filter(
            ArticleComment.article_id == article_id
        )
        .order_by(
            ArticleComment.created_at.desc()
        )
        .all()
    )

    # --------------------------------------
    # RETURN COMMENTS
    # --------------------------------------

    return [
        {
            "id": comment.id,
            "article_id": comment.article_id,
            "user_id": comment.user_id,
            "user_name": (
                comment.user.name
                if comment.user
                else "User"
            ),
            "comment": comment.comment,
            "created_at": comment.created_at
        }
        for comment in comments
    ]


# ==========================================
# AUTHOR / REVIEWER ARTICLE ENGAGEMENT
# LOGIN REQUIRED
# AUTHOR / REVIEWER
# ==========================================

@router.get("/{article_id}/engagement")
def get_article_engagement(
    article_id: int,

    current_user: User = Depends(
        require_role("author", "reviewer")
    ),

    db: Session = Depends(get_db)
):

    # --------------------------------------
    # FIND ARTICLE
    # --------------------------------------

    article = (
        db.query(Article)
        .filter(
            Article.id == article_id
        )
        .first()
    )

    if not article:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )

    # --------------------------------------
    # AUTHOR CAN SEE ONLY OWN ARTICLES
    # REVIEWER CAN SEE ALL ARTICLES
    # --------------------------------------

    if (
        current_user.role == "author"
        and article.author != current_user.name
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only view engagement for your own articles"
        )

    # --------------------------------------
    # LIKE COUNT
    # --------------------------------------

    like_count = (
        db.query(ArticleLike)
        .filter(
            ArticleLike.article_id == article_id
        )
        .count()
    )

    # --------------------------------------
    # COMMENTS
    # --------------------------------------

    comments = (
        db.query(ArticleComment)
        .filter(
            ArticleComment.article_id == article_id
        )
        .order_by(
            ArticleComment.created_at.desc()
        )
        .all()
    )

    # --------------------------------------
    # SHARE COUNT
    # --------------------------------------

    share_count = (
        db.query(ArticleShare)
        .filter(
            ArticleShare.article_id == article_id
        )
        .count()
    )

    # --------------------------------------
    # RESPONSE
    # --------------------------------------

    return {
        "article_id": article.id,

        "like_count": like_count,

        "comment_count": len(comments),

        "share_count": share_count,

        "comments": [
            {
                "id": comment.id,

                "user_id": comment.user_id,

                "user_name": (
                    comment.user.name
                    if comment.user
                    else "User"
                ),

                "comment": comment.comment,

                "created_at": comment.created_at
            }

            for comment in comments
        ]
    }


# ==========================================
# SHARE ARTICLE
# LOGIN REQUIRED
# USER / AUTHOR / REVIEWER
# ==========================================

@router.post("/{article_id}/share")
def share_article(
    article_id: int,

    current_user: User = Depends(
        require_role("user", "author", "reviewer")
    ),

    db: Session = Depends(get_db)
):

    # --------------------------------------
    # CHECK ARTICLE
    # --------------------------------------

    article = (
        db.query(Article)
        .filter(
            Article.id == article_id,
            Article.status == "published"
        )
        .first()
    )

    if not article:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )

    # --------------------------------------
    # SAVE SHARE
    # --------------------------------------

    new_share = ArticleShare(
        article_id=article_id,
        user_id=current_user.id
    )

    db.add(new_share)
    db.commit()
    db.refresh(new_share)

    # --------------------------------------
    # GET UPDATED COUNT
    # --------------------------------------

    share_count = (
        db.query(ArticleShare)
        .filter(
            ArticleShare.article_id == article_id
        )
        .count()
    )

    return {
        "shared": True,
        "share_count": share_count
    }


# ==========================================
# PUBLIC ARTICLE ENGAGEMENT
# NO LOGIN REQUIRED
# ==========================================

@router.get("/{article_id}/engagement/public")
def get_public_article_engagement(
    article_id: int,
    db: Session = Depends(get_db)
):

    # --------------------------------------
    # CHECK ARTICLE
    # --------------------------------------

    article = (
        db.query(Article)
        .filter(
            Article.id == article_id,
            Article.status == "published"
        )
        .first()
    )

    if not article:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )

    # --------------------------------------
    # LIKE COUNT
    # --------------------------------------

    like_count = (
        db.query(ArticleLike)
        .filter(
            ArticleLike.article_id == article_id
        )
        .count()
    )

    # --------------------------------------
    # COMMENT COUNT
    # --------------------------------------

    comment_count = (
        db.query(ArticleComment)
        .filter(
            ArticleComment.article_id == article_id
        )
        .count()
    )

    # --------------------------------------
    # SHARE COUNT
    # --------------------------------------

    share_count = (
        db.query(ArticleShare)
        .filter(
            ArticleShare.article_id == article_id
        )
        .count()
    )

    return {
        "article_id": article_id,
        "like_count": like_count,
        "comment_count": comment_count,
        "share_count": share_count
    }

@router.get("/{article_id}/engagement/public")
def get_public_engagement(
    article_id: int,
    db: Session = Depends(get_db)
):
    article = db.query(Article).filter(
        Article.id == article_id,
        Article.status == "published"
    ).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    like_count = db.query(ArticleLike).filter(
        ArticleLike.article_id == article_id
    ).count()

    comment_count = db.query(ArticleComment).filter(
        ArticleComment.article_id == article_id
    ).count()

    share_count = db.query(ArticleShare).filter(
        ArticleShare.article_id == article_id
    ).count()

    return {
        "like_count": like_count,
        "comment_count": comment_count,
        "share_count": share_count
    }        