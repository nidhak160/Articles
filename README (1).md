# Article News & Stories

A full-stack article/news management application built with **FastAPI**, **SQLAlchemy**, **PostgreSQL**, **React**, and **Vite**.

The application provides article management, categories, subcategories, image upload, article filtering, and a React-based news interface.

---

## 1. Project Overview

The project is divided into two main applications:

- `backend/` — FastAPI REST API and PostgreSQL database integration.
- `frontend/` — React/Vite user interface.

The application supports:

- Articles
- Categories
- Subcategories
- Article filtering by category
- Article filtering by subcategory
- Single article details
- Article image upload
- Published date
- Author information
- Short description
- Category/subcategory relationships
- Delete article functionality

---

## 2. Technology Stack

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- PostgreSQL
- Pydantic
- psycopg2-binary

### Frontend

- React
- Vite
- JavaScript
- CSS
- React Router DOM
- Axios/API service layer

---

## 3. Project Structure

```text
Article/
│
├── backend/
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       └── routes/
│           ├── articles.py
│           ├── categories.py
│           └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Category.jsx
│   │   │   ├── Subcategory.jsx
│   │   │   └── ArticleDetails.jsx
│   │   └── services/
│   │       └── api.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 4. Database Structure

The main database entities are:

### Category

A category represents a major article section.

Examples:

- News
- Technology
- Business
- Sports
- Entertainment
- Science
- Travel
- Lifestyle
- Education
- Automobile

### Subcategory

A subcategory belongs to a category.

Examples:

- News → Local News
- Technology → Artificial Intelligence
- Business → Finance
- Sports → Cricket
- Entertainment → Movies
- Science → Environment
- Travel → Destinations
- Lifestyle → Fashion
- Education → Online Learning
- Automobile → Cars

### Article

An article contains:

- `id`
- `title`
- `short_description`
- `image`
- `author`
- `published_date`
- `category_id`
- `subcategory_id`
- `status`
- timestamps

The article is connected to a category and can optionally be connected to a subcategory.

---

## 5. Backend Setup

Open a terminal in the backend project.

### Create virtual environment

```bash
python -m venv venv
```

### Activate on Windows

```bat
venv\Scripts\activate
```

### Install dependencies

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-multipart
```

`python-multipart` is required when FastAPI receives form data and uploaded files.

---

## 6. PostgreSQL Configuration

Create a PostgreSQL database for the application.

Configure the database connection in the backend database configuration.

Example format:

```text
postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME
```

Do not commit real database passwords or secret credentials to GitHub.

Use environment variables for production credentials.

---

## 7. Run the Backend

From the backend project directory:

```bash
uvicorn app.main:app --reload
```

The development server normally runs at:

```text
http://127.0.0.1:8000
```

FastAPI Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

ReDoc:

```text
http://127.0.0.1:8000/redoc
```

---

## 8. Image Upload

Articles support image uploads.

Uploaded images are stored in the backend `uploads/` directory.

The API stores an image path similar to:

```text
/uploads/example-image.jpg
```

The FastAPI application should expose the upload directory as static files so the React frontend can display uploaded images.

For local development, an image URL may look like:

```text
http://127.0.0.1:8000/uploads/example-image.jpg
```

The current article upload implementation accepts:

- JPEG
- PNG
- WEBP

The implementation also limits uploaded images to 5 MB.

---

## 9. Article API

### Get all articles

```http
GET /articles/
```

### Create article

```http
POST /articles/
```

The create endpoint accepts form data and an optional image upload.

Typical fields:

```text
title
short_description
author
published_date
category_id
subcategory_id
image
```

### Get one article

```http
GET /articles/{article_id}
```

### Get articles by category

```http
GET /articles/category/{category_id}
```

### Get articles by subcategory

```http
GET /articles/subcategory/{subcategory_id}
```

### Delete article

```http
DELETE /articles/{article_id}
```

---

## 10. Category API

The category API provides category information together with subcategories.

Example response:

```json
[
  {
    "id": 1,
    "name": "News",
    "subcategories": [
      {
        "id": 1,
        "name": "Local News",
        "category_id": 1
      }
    ]
  }
]
```

---

## 11. Frontend Setup

Open another terminal and go to:

```text
frontend/
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The Vite development server normally runs at:

```text
http://localhost:5173
```

---

## 12. Frontend Pages

### Home

```text
/
```

The home page displays:

- Featured article
- Categories
- Latest articles
- Category-based article sections

### Category

```text
/category/:id
```

Displays articles belonging to a selected category.

Example:

```text
/category/4
```

### Subcategory

```text
/subcategory/:id
```

Displays articles belonging to a selected subcategory.

Example:

```text
/subcategory/1
```

### Article Details

```text
/articles/:id
```

Displays the complete details of a selected article.

---

## 13. Navigation

The application contains a fixed top navbar and a fixed sidebar.

The sidebar contains:

- Home
- Categories
- Three-dot controls for categories with subcategories
- Subcategory links

Clicking a category opens its category page.

Clicking the three-dot button displays its subcategories.

---

## 14. Git Branch Structure

The project uses separate branches for development and documentation.

```text
main
code
docs
```

### main

Stable/base version of the repository.

### code

Application development branch.

Use this branch for:

- Backend changes
- Frontend changes
- New features
- Bug fixes

Typical workflow:

```bash
git checkout code
git add .
git commit -m "Add new article feature"
git push
```

### docs

Documentation branch.

Use this branch for:

- README
- API documentation
- Setup documentation
- Project explanation
- Screenshots
- PDF documentation

---

## 15. Recommended Git Workflow

Before starting work:

```bash
git checkout code
git pull origin code
```

After making changes:

```bash
git status
git add .
git commit -m "Describe your changes"
git push origin code
```

For documentation:

```bash
git checkout docs
git pull origin docs
```

Then commit documentation changes:

```bash
git add .
git commit -m "Update project documentation"
git push origin docs
```

---

## 16. Important Git Files

### `.gitignore`

The project should not commit:

```text
venv/
__pycache__/
*.pyc
.env
node_modules/
dist/
```

Never commit passwords, API keys, access tokens, or other secrets.

---

## 17. Common Development Issues

### FastAPI app not loading

Check that the command matches the project structure:

```bash
uvicorn app.main:app --reload
```

Also make sure `app = FastAPI()` is created before routes or mounting operations that use `app`.

### Image not loading

Check:

1. The file exists in `backend/uploads/`.
2. FastAPI serves `/uploads`.
3. The database image path starts with `/uploads/`.
4. The frontend builds the complete backend URL.

### React route not found

Make sure the route exists in `App.jsx`.

Example:

```jsx
<Route path="/category/:id" element={<Category />} />
<Route path="/subcategory/:id" element={<Subcategory />} />
<Route path="/articles/:id" element={<ArticleDetails />} />
```

### Category data not appearing

Check:

- FastAPI is running.
- `/categories/` returns data.
- The frontend API base URL is correct.
- Browser developer tools for network errors.

---

## 18. Development URLs

Backend:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

Frontend:

```text
http://localhost:5173
```

---

## 19. Future Improvements

Possible future features include:

- Article search
- Pagination
- Article editing
- Category management UI
- Subcategory management UI
- Authentication
- Admin dashboard
- Rich article content
- Image optimization
- Cloud image storage
- Production deployment
- Automated testing

---

## 20. Project Status

This project is a full-stack Article / News application with:

- FastAPI backend
- PostgreSQL database
- React frontend
- Category and subcategory navigation
- Article creation
- Image upload
- Article filtering
- Article details
- Fixed navigation UI
- Separate Git branches for code and documentation
