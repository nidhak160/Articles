import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
    getCategories,
    createArticle,
    updateArticle,
    submitArticle,
    getMyArticles,
} from "../services/api";

import "./AddArticle.css";


function AddArticle() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const editId = searchParams.get("edit");

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        short_description: "",
        content: "",
        category_id: "",
        subcategory_id: "",
        image: null,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    // ==========================================
    // LOAD CATEGORIES
    // ==========================================

    useEffect(() => {

        loadCategories();

    }, []);


    // ==========================================
    // LOAD ARTICLE WHEN EDITING
    // ==========================================

    useEffect(() => {

        if (editId) {
            loadArticle(editId);
        }

    }, [editId]);


    // ==========================================
    // GET CATEGORIES
    // ==========================================

    const loadCategories = async () => {

        try {

            const data = await getCategories();

            setCategories(data);

        } catch (err) {

            console.error(err);

            setError("Failed to load categories");

        }

    };


    // ==========================================
    // GET ARTICLE FOR EDIT
    // ==========================================

    const loadArticle = async (id) => {

        try {

            const articles = await getMyArticles();

            const article = articles.find(
                (item) => item.id === Number(id)
            );

            if (!article) {

                setError("Article not found");

                return;
            }


            setFormData({
                title: article.title || "",
                short_description: article.short_description || "",
                content: article.content || "",
                category_id: article.category_id || "",
                subcategory_id: article.subcategory_id || "",
                image: null,
            });


            const category = categories.find(
                (cat) => cat.id === article.category_id
            );

            if (category) {

                setSubcategories(
                    category.subcategories || []
                );

            }

        } catch (err) {

            console.error(err);

            setError("Failed to load article");

        }

    };


    // ==========================================
    // INPUT CHANGE
    // ==========================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));


        // Category changed
        if (name === "category_id") {

            const selectedCategory = categories.find(
                (category) =>
                    category.id === Number(value)
            );

            setSubcategories(
                selectedCategory?.subcategories || []
            );


            setFormData((prev) => ({
                ...prev,
                category_id: value,
                subcategory_id: "",
            }));

        }

    };


    // ==========================================
    // IMAGE CHANGE
    // ==========================================

    const handleImageChange = (e) => {

        const file = e.target.files[0];

        if (!file) return;


        // Allowed image types
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];


        if (!allowedTypes.includes(file.type)) {

            setError(
                "Only JPG, PNG and WEBP images are allowed."
            );

            return;
        }


        // Maximum 5MB
        if (file.size > 5 * 1024 * 1024) {

            setError(
                "Image size must be less than 5MB."
            );

            return;
        }


        setError("");

        setFormData((prev) => ({
            ...prev,
            image: file,
        }));

    };


    // ==========================================
    // VALIDATION
    // ==========================================

    const validateForm = () => {

        if (!formData.title.trim()) {

            setError("Title is required");

            return false;
        }


        if (!formData.short_description.trim()) {

            setError("Short description is required");

            return false;
        }


        if (!formData.content.trim()) {

            setError("Content is required");

            return false;
        }


        if (!formData.category_id) {

            setError("Please select a category");

            return false;
        }


        return true;

    };


    // ==========================================
    // SAVE DRAFT
    // ==========================================

    const handleSaveDraft = async () => {

        setError("");
        setMessage("");


        if (!validateForm()) return;


        setLoading(true);


        try {

            let article;


            if (editId) {

                article = await updateArticle(
                    editId,
                    formData
                );

            } else {

                article = await createArticle(
                    formData
                );

            }


            setMessage(
                "Article saved as draft successfully."
            );


            // If new article, go to edit mode
            if (!editId && article?.id) {

                navigate(
                    `/add?edit=${article.id}`
                );

            }

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Failed to save article"
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // SUBMIT FOR REVIEW
    // ==========================================

    const handleSubmitReview = async () => {

        setError("");
        setMessage("");


        if (!validateForm()) return;


        setLoading(true);


        try {

            let articleId = editId;


            // If article doesn't exist yet,
            // create it first
            if (!articleId) {

                const article =
                    await createArticle(formData);

                articleId = article.id;

            } else {

                // Save latest changes first
                await updateArticle(
                    articleId,
                    formData
                );

            }


            // Submit to reviewer
            await submitArticle(articleId);


            setMessage(
                "Article submitted for review successfully."
            );


            setTimeout(() => {

                navigate("/author/dashboard");

            }, 1000);


        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Failed to submit article"
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="add-article-page">

            <div className="add-article-container">


                {/* HEADER */}

                <div className="article-header">

                    <div>

                        <h1>
                            {editId
                                ? "Edit Article"
                                : "Create Article"}
                        </h1>

                        <p>
                            Write and submit your article
                            for review.
                        </p>

                    </div>


                    <button
                        className="back-btn"
                        onClick={() =>
                            navigate("/author/dashboard")
                        }
                    >
                        ← Dashboard
                    </button>

                </div>


                {/* MESSAGE */}

                {message && (

                    <div className="success-message">
                        {message}
                    </div>

                )}


                {error && (

                    <div className="error-message">
                        {error}
                    </div>

                )}


                {/* FORM */}

                <div className="article-form">


                    {/* TITLE */}

                    <div className="form-group">

                        <label>
                            Article Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter article title"
                        />

                    </div>


                    {/* SHORT DESCRIPTION */}

                    <div className="form-group">

                        <label>
                            Short Description
                        </label>

                        <textarea
                            name="short_description"
                            value={
                                formData.short_description
                            }
                            onChange={handleChange}
                            placeholder="Write a short description"
                            rows="4"
                        />

                    </div>


                    {/* CONTENT */}

                    <div className="form-group">

                        <label>
                            Article Content
                        </label>

                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="Write your article content..."
                            rows="12"
                        />

                    </div>


                    {/* CATEGORY */}

                    <div className="form-row">


                        <div className="form-group">

                            <label>
                                Category
                            </label>

                            <select
                                name="category_id"
                                value={
                                    formData.category_id
                                }
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select Category
                                </option>


                                {categories.map(
                                    (category) => (

                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* SUBCATEGORY */}

                        <div className="form-group">

                            <label>
                                Subcategory
                            </label>

                            <select
                                name="subcategory_id"
                                value={
                                    formData.subcategory_id
                                }
                                onChange={handleChange}
                                disabled={
                                    subcategories.length === 0
                                }
                            >

                                <option value="">
                                    Select Subcategory
                                </option>


                                {subcategories.map(
                                    (subcategory) => (

                                        <option
                                            key={
                                                subcategory.id
                                            }
                                            value={
                                                subcategory.id
                                            }
                                        >
                                            {subcategory.name}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>


                    {/* IMAGE */}

                    <div className="form-group">

                        <label>
                            Article Image
                        </label>

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={
                                handleImageChange
                            }
                        />

                        <small>
                            JPG, PNG or WEBP · Maximum 5MB
                        </small>

                    </div>


                    {/* ACTIONS */}

                    <div className="article-actions">

                        <button
                            type="button"
                            className="draft-btn"
                            onClick={handleSaveDraft}
                            disabled={loading}
                        >

                            {loading
                                ? "Saving..."
                                : "Save Draft"}

                        </button>


                        <button
                            type="button"
                            className="submit-btn"
                            onClick={
                                handleSubmitReview
                            }
                            disabled={loading}
                        >

                            {loading
                                ? "Submitting..."
                                : "Submit for Review"}

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default AddArticle;