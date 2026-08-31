import axios from "axios";

const API_URL = "http://127.0.0.1:8000";


// ==========================================
// GET CATEGORIES
// ==========================================

export const getCategories = async () => {
    const response = await axios.get(
        `${API_URL}/categories/`
    );

    return response.data;
};


// ==========================================
// GET ALL ARTICLES
// ==========================================

export const getArticles = async () => {
    const response = await axios.get(
        `${API_URL}/articles/`
    );

    return response.data;
};


// ==========================================
// GET SINGLE ARTICLE
// ==========================================

export const getArticle = async (id) => {
    const response = await axios.get(
        `${API_URL}/articles/${id}`
    );

    return response.data;
};


// ==========================================
// GET ARTICLES BY CATEGORY
// ==========================================

export const getArticlesByCategory = async (categoryId) => {
    const response = await axios.get(
        `${API_URL}/articles/category/${categoryId}`
    );

    return response.data;
};


// ==========================================
// GET ARTICLES BY SUBCATEGORY
// ==========================================

export const getArticlesBySubcategory = async (subcategoryId) => {
    const response = await axios.get(
        `${API_URL}/articles/subcategory/${subcategoryId}`
    );

    return response.data;
};


// ==========================================
// CREATE ARTICLE
// ==========================================

export const createArticle = async (articleData) => {

    const formData = new FormData();

    formData.append(
        "title",
        articleData.title
    );

    formData.append(
        "short_description",
        articleData.short_description
    );

    formData.append(
        "content",
        articleData.content
    );

    formData.append(
        "author",
        articleData.author
    );


    if (articleData.published_date) {
        formData.append(
            "published_date",
            articleData.published_date
        );
    }


    formData.append(
        "category_id",
        articleData.category_id
    );


    if (articleData.subcategory_id) {
        formData.append(
            "subcategory_id",
            articleData.subcategory_id
        );
    }


    if (articleData.image) {
        formData.append(
            "image",
            articleData.image
        );
    }


    const response = await axios.post(
        `${API_URL}/articles/`,
        formData
    );

    return response.data;
};


// ==========================================
// DELETE ARTICLE
// ==========================================

export const deleteArticle = async (id) => {

    const response = await axios.delete(
        `${API_URL}/articles/${id}`
    );

    return response.data;
};