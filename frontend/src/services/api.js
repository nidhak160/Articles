import axios from "axios";

const API_URL = "http://127.0.0.1:8000";


// ==========================================
// REGISTER USER
// ==========================================

export const registerUser = async (userData) => {

    const response = await axios.post(
        `${API_URL}/auth/register`,
        userData
    );

    return response.data;
};


// ==========================================
// LOGIN USER
// ==========================================

export const loginUser = async (email, password) => {

    const formData = new URLSearchParams();

    formData.append("username", email);
    formData.append("password", password);

    const response = await axios.post(
        `${API_URL}/auth/login`,
        formData,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );

    return response.data;
};


// ==========================================
// GET CATEGORIES
// PUBLIC
// ==========================================

export const getCategories = async () => {

    const response = await axios.get(
        `${API_URL}/categories/`
    );

    return response.data;
};


// ==========================================
// GET ALL PUBLISHED ARTICLES
// PUBLIC
// ==========================================

export const getArticles = async () => {

    const response = await axios.get(
        `${API_URL}/articles/`
    );

    return response.data;
};


// ==========================================
// GET SINGLE ARTICLE
// PUBLIC
// ==========================================

export const getArticle = async (id) => {

    const response = await axios.get(
        `${API_URL}/articles/${id}`
    );

    return response.data;
};


// ==========================================
// GET ARTICLES BY CATEGORY
// PUBLIC
// ==========================================

export const getArticlesByCategory = async (categoryId) => {

    const response = await axios.get(
        `${API_URL}/articles/category/${categoryId}`
    );

    return response.data;
};


// ==========================================
// GET ARTICLES BY SUBCATEGORY
// PUBLIC
// ==========================================

export const getArticlesBySubcategory = async (
    subcategoryId
) => {

    const response = await axios.get(
        `${API_URL}/articles/subcategory/${subcategoryId}`
    );

    return response.data;
};


// ==========================================
// CREATE ARTICLE
// AUTHOR ONLY
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


    const token = localStorage.getItem("token");


    const response = await axios.post(
        `${API_URL}/articles/`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// ==========================================
// GET MY ARTICLES
// AUTHOR ONLY
// ==========================================

export const getMyArticles = async () => {

    const token = localStorage.getItem("token");


    const response = await axios.get(
        `${API_URL}/articles/my/articles`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// ==========================================
// UPDATE ARTICLE
// AUTHOR ONLY
// ==========================================

export const updateArticle = async (
    id,
    articleData
) => {

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


    const token = localStorage.getItem("token");


    const response = await axios.put(
        `${API_URL}/articles/${id}`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// ==========================================
// SUBMIT ARTICLE FOR REVIEW
// AUTHOR ONLY
// ==========================================

export const submitArticle = async (id) => {

    const token = localStorage.getItem("token");


    const response = await axios.put(
        `${API_URL}/articles/${id}/submit`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// ==========================================
// DELETE ARTICLE
// AUTHOR ONLY
// ==========================================

export const deleteArticle = async (id) => {

    const token = localStorage.getItem("token");


    const response = await axios.delete(
        `${API_URL}/articles/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// ==========================================
// REVIEWER
// GET ARTICLES
// ==========================================

export const getReviewArticles = async () => {

    const token = localStorage.getItem("token");


    const response = await axios.get(
        `${API_URL}/reviewer/articles`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// ==========================================
// REVIEWER
// APPROVE ARTICLE
// ==========================================

export const approveArticle = async (id) => {

    const token = localStorage.getItem("token");


    const response = await axios.put(
        `${API_URL}/reviewer/articles/${id}/approve`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// ==========================================
// REVIEWER
// REJECT ARTICLE
// ==========================================

export const rejectArticle = async (
    id,
    reason
) => {

    const token = localStorage.getItem("token");


    const response = await axios.put(
        `${API_URL}/reviewer/articles/${id}/reject`,
        {
            reason: reason,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// ==========================================
// REVIEWER
// PUBLISH ARTICLE
// ==========================================

export const publishArticle = async (id) => {

    const token = localStorage.getItem("token");


    const response = await axios.put(
        `${API_URL}/reviewer/articles/${id}/publish`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// ==========================================
// LIKE ARTICLE
// LOGIN USER ONLY
// ==========================================

export const likeArticle = async (articleId) => {
    const token = localStorage.getItem("token");

    const response = await axios.post(
        `${API_URL}/articles/${articleId}/like`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// ==========================================
// GET ARTICLE LIKE STATUS
// LOGIN USER ONLY
// ==========================================

export const getArticleLikeStatus = async (articleId) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API_URL}/articles/${articleId}/like`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// ==========================================
// ADD COMMENT
// LOGIN USER ONLY
// ==========================================

export const addComment = async (articleId, comment) => {
    const token = localStorage.getItem("token");

    const response = await axios.post(
        `${API_URL}/articles/${articleId}/comments`,
        {
            comment: comment,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    return response.data;
};


// ==========================================
// GET ARTICLE COMMENTS
// PUBLIC
// ==========================================

export const getComments = async (articleId) => {
    const response = await axios.get(
        `${API_URL}/articles/${articleId}/comments`
    );

    return response.data;
};

export const getArticleEngagement = async (articleId) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API_URL}/articles/${articleId}/engagement`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

// ==========================================
// SHARE ARTICLE
// LOGIN USER ONLY
// ==========================================

export const shareArticle = async (articleId) => {

    const token = localStorage.getItem("token");

    const response = await axios.post(
        `${API_URL}/articles/${articleId}/share`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// ==========================================
// GET ARTICLE PUBLIC ENGAGEMENT
// ==========================================

export const getPublicArticleEngagement = async (
    articleId
) => {

    const response = await axios.get(
        `${API_URL}/articles/${articleId}/engagement/public`
    );

    return response.data;
};

