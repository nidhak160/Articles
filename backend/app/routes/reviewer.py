from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Article, User
from ..schemas import ArticleResponse
from .auth import require_role


router = APIRouter(
    prefix="/reviewer",
    tags=["Reviewer"]
)


# ==========================================
# REJECTION REQUEST
# ==========================================

class RejectRequest(BaseModel):
    reason: str


# ==========================================
# GET ARTICLES FOR REVIEW
# REVIEWER ONLY
# ==========================================

@router.get(
    "/articles",
    response_model=list[ArticleResponse]
)
def get_review_articles(

    current_user: User = Depends(
        require_role("reviewer")
    ),

    db: Session = Depends(get_db)
):

    articles = db.query(Article).filter(
        Article.status.in_([
            "pending_review",
            "approved"
        ])
    ).order_by(
        Article.created_at.desc()
    ).all()

    return articles


# ==========================================
# APPROVE ARTICLE
# REVIEWER ONLY
# ==========================================

@router.put(
    "/articles/{article_id}/approve",
    response_model=ArticleResponse
)
def approve_article(

    article_id: int,

    current_user: User = Depends(
        require_role("reviewer")
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
    # CHECK STATUS
    # ======================================

    if article.status != "pending_review":

        raise HTTPException(
            status_code=400,
            detail="Only pending articles can be approved"
        )


    # ======================================
    # APPROVE
    # ======================================

    article.status = "approved"

    db.commit()

    db.refresh(article)

    return article


# ==========================================
# REJECT ARTICLE
# REVIEWER ONLY
# ==========================================

@router.put(
    "/articles/{article_id}/reject"
)
def reject_article(

    article_id: int,

    request: RejectRequest,

    current_user: User = Depends(
        require_role("reviewer")
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
    # CHECK STATUS
    # ======================================

    if article.status != "pending_review":

        raise HTTPException(
            status_code=400,
            detail="Only pending articles can be rejected"
        )


    # ======================================
    # CHECK REASON
    # ======================================

    reason = request.reason.strip()

    if not reason:

        raise HTTPException(
            status_code=400,
            detail="Rejection reason is required"
        )


    # ======================================
    # REJECT
    # ======================================

    article.status = "rejected"

    db.commit()

    db.refresh(article)


    return {
        "message": "Article rejected successfully",
        "article_id": article.id,
        "status": article.status,
        "reason": reason
    }


# ==========================================
# PUBLISH ARTICLE
# REVIEWER ONLY
# ==========================================

@router.put(
    "/articles/{article_id}/publish",
    response_model=ArticleResponse
)
def publish_article(

    article_id: int,

    current_user: User = Depends(
        require_role("reviewer")
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
    # CHECK STATUS
    # ======================================

    if article.status != "approved":

        raise HTTPException(
            status_code=400,
            detail="Only approved articles can be published"
        )


    # ======================================
    # PUBLISH
    # ======================================

    article.status = "published"

    article.published_date = datetime.utcnow()

    db.commit()

    db.refresh(article)

    return article