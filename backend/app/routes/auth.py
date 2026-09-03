from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm
)

from jose import JWTError, jwt
from sqlalchemy.orm import Session
import bcrypt
from ..database import get_db
from ..models import User
from ..schemas import (
    UserRegister,
    UserResponse,
    LoginResponse
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ==========================================
# JWT SETTINGS
# ==========================================

SECRET_KEY = "article_secret_key_change_this"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60





# ==========================================
# OAUTH2
# ==========================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


# ==========================================
# HASH PASSWORD
# ==========================================

def hash_password(password: str):

    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        raise ValueError(
            "Password cannot be longer than 72 bytes"
        )

    return bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    ).decode("utf-8")


# ==========================================
# VERIFY PASSWORD
# ==========================================

def verify_password(
    plain_password: str,
    hashed_password: str
):

    password_bytes = plain_password.encode("utf-8")

    if len(password_bytes) > 72:
        return False

    return bcrypt.checkpw(
        password_bytes,
        hashed_password.encode("utf-8")
    )



# ==========================================
# CREATE ACCESS TOKEN
# ==========================================

def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None
):

    to_encode = data.copy()

    if expires_delta:

        expire = datetime.utcnow() + expires_delta

    else:

        expire = datetime.utcnow() + timedelta(
            minutes=15
        )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ==========================================
# REGISTER
# ==========================================

@router.post(
    "/register",
    response_model=dict
)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):

    # --------------------------------------
    # Allowed Roles
    # --------------------------------------

    allowed_roles = [
        "user",
        "author",
        "reviewer"
    ]

    if user_data.role not in allowed_roles:

        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    # --------------------------------------
    # Check Existing Email
    # --------------------------------------

    existing_user = (
        db.query(User)
        .filter(
            User.email == user_data.email
        )
        .first()
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # --------------------------------------
    # Create User
    # --------------------------------------

    new_user = User(

        name=user_data.name,

        email=user_data.email,

        password=hash_password(
            user_data.password
        ),

        role=user_data.role
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return {

        "message": "User registered successfully",

        "user": {

            "id": new_user.id,

            "name": new_user.name,

            "email": new_user.email,

            "role": new_user.role
        }
    }


# ==========================================
# LOGIN
# ==========================================

@router.post(
    "/login",
    response_model=LoginResponse
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    # --------------------------------------
    # Find User
    # --------------------------------------

    user = (
        db.query(User)
        .filter(
            User.email == form_data.username
        )
        .first()
    )

    # --------------------------------------
    # Check User
    # --------------------------------------

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # --------------------------------------
    # Check Password
    # --------------------------------------

    if not verify_password(
        form_data.password,
        user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # --------------------------------------
    # Create JWT
    # --------------------------------------

    access_token = create_access_token(

        data={
            "sub": str(user.id),
            "role": user.role
        },

        expires_delta=timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    # --------------------------------------
    # Return Response
    # --------------------------------------

    return {

        "access_token": access_token,

        "token_type": "bearer",

        "user": {

            "id": user.id,

            "name": user.name,

            "email": user.email,

            "role": user.role
        }
    }


# ==========================================
# GET CURRENT USER
# ==========================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    credentials_exception = HTTPException(

        status_code=401,

        detail="Could not validate credentials",

        headers={
            "WWW-Authenticate": "Bearer"
        }
    )

    # --------------------------------------
    # Decode Token
    # --------------------------------------

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:

            raise credentials_exception

    except JWTError:

        raise credentials_exception

    # --------------------------------------
    # Find User
    # --------------------------------------

    try:

        user_id = int(user_id)

    except (TypeError, ValueError):

        raise credentials_exception

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if user is None:

        raise credentials_exception

    return user


# ==========================================
# ROLE CHECK
# ==========================================

def require_role(*roles):
    def role_checker(
        current_user: User = Depends(get_current_user)
    ):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=403,
                detail="Not authorized"
            )

        return current_user

    return role_checker