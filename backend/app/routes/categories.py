from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Category, SubCategory
from ..schemas import (
    CategoryCreate,
    CategoryResponse,
    SubCategoryCreate,
    SubCategoryResponse,
)


router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


# ==========================================
# CREATE CATEGORY
# ==========================================

@router.post("/", response_model=CategoryResponse)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db)
):
    existing = (
        db.query(Category)
        .filter(Category.name == category.name)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )

    new_category = Category(
        name=category.name
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


# ==========================================
# GET ALL CATEGORIES
# ==========================================

@router.get("/", response_model=list[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db)
):
    return db.query(Category).all()


# ==========================================
# GET SINGLE CATEGORY
# ==========================================

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return category


# ==========================================
# CREATE SUBCATEGORY
# ==========================================

@router.post(
    "/subcategories/",
    response_model=SubCategoryResponse
)
def create_subcategory(
    subcategory: SubCategoryCreate,
    db: Session = Depends(get_db)
):

    category = (
        db.query(Category)
        .filter(Category.id == subcategory.category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    existing = (
        db.query(SubCategory)
        .filter(
            SubCategory.name == subcategory.name,
            SubCategory.category_id == subcategory.category_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Subcategory already exists"
        )

    new_subcategory = SubCategory(
        name=subcategory.name,
        category_id=subcategory.category_id
    )

    db.add(new_subcategory)
    db.commit()
    db.refresh(new_subcategory)

    return new_subcategory


# ==========================================
# GET SUBCATEGORIES
# ==========================================

@router.get(
    "/{category_id}/subcategories/",
    response_model=list[SubCategoryResponse]
)
def get_subcategories(
    category_id: int,
    db: Session = Depends(get_db)
):

    category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return (
        db.query(SubCategory)
        .filter(
            SubCategory.category_id == category_id
        )
        .all()
    )