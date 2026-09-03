import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getMyArticles,
    getArticleEngagement,
    submitArticle,
    deleteArticle
} from "../services/api";

import "./AuthorDashboard.css";

function AuthorDashboard() {

    const navigate = useNavigate();

    // ==========================================
    // STATES
    // ==========================================

    const [articles, setArticles] = useState([]);
    const [engagement, setEngagement] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // CURRENT USER
    // ==========================================

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    // ==========================================
    // LOAD ARTICLES
    // ==========================================

    const loadArticles = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getMyArticles();

            console.log(
                "My Articles:",
                data
            );

            const articleList =
                Array.isArray(data)
                    ? data
                    : [];

            setArticles(articleList);

            // ==========================================
            // LOAD ENGAGEMENT
            // ==========================================

            const engagementData = {};

            await Promise.all(

                articleList.map(
                    async (article) => {

                        if (
                            article.status !==
                            "published"
                        ) {

                            engagementData[
                                article.id
                            ] = {
                                like_count: 0,
                                comment_count: 0,
                                share_count: 0
                            };

                            return;
                        }

                        try {

                            const result =
                                await getArticleEngagement(
                                    article.id
                                );

                            engagementData[
                                article.id
                            ] = {

                                like_count:
                                    result.like_count ??
                                    0,

                                comment_count:
                                    result.comment_count ??
                                    0,

                                share_count:
                                    result.share_count ??
                                    0

                            };

                        } catch (err) {

                            console.error(
                                `Engagement error for article ${article.id}:`,
                                err
                            );

                            engagementData[
                                article.id
                            ] = {

                                like_count: 0,

                                comment_count: 0,

                                share_count: 0

                            };

                        }

                    }
                )

            );

            setEngagement(
                engagementData
            );

        } catch (err) {

            console.error(
                "Author articles error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load articles."
            );

            setArticles([]);

        } finally {

            setLoading(false);

        }

    };

    // ==========================================
    // LOAD ON PAGE OPEN
    // ==========================================

    useEffect(() => {

        loadArticles();

    }, []);

    // ==========================================
    // SUBMIT ARTICLE
    // ==========================================

    const handleSubmit = async (id) => {

        try {

            await submitArticle(id);

            alert(
                "Article submitted for review."
            );

            await loadArticles();

        } catch (err) {

            console.error(
                "Submit article error:",
                err
            );

            alert(
                err.response?.data?.detail ||
                "Unable to submit article."
            );

        }

    };

    // ==========================================
    // DELETE ARTICLE
    // ==========================================

    const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this article?"
            );

        if (!confirmDelete) {
            return;
        }

        try {

            await deleteArticle(id);

            alert(
                "Article deleted successfully."
            );

            await loadArticles();

        } catch (err) {

            console.error(
                "Delete article error:",
                err
            );

            alert(
                err.response?.data?.detail ||
                "Unable to delete article."
            );

        }

    };

    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

    };

    // ==========================================
    // VIEW ARTICLE
    // ==========================================

    const handleViewArticle = (id) => {

        navigate(
            `/article/${id}`
        );

    };

    // ==========================================
    // CREATE ARTICLE
    // ==========================================

    const handleCreateArticle = () => {

        navigate("/add");

    };

    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="author-dashboard">

            {/* ==========================================
                HEADER
            ========================================== */}

            <header className="author-header">

                <div className="author-header-left">

                    <h1>
                        Author Dashboard
                    </h1>

                    <p>
                        Welcome,{" "}
                        {user?.name || "Author"}
                    </p>

                </div>

                <div className="author-header-actions">

                    <button
                        className="create-btn"
                        onClick={handleCreateArticle}
                    >
                        + Create Article
                    </button>

                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>

            {/* ==========================================
                ERROR
            ========================================== */}

            {error && (

                <div className="dashboard-error">
                    {error}
                </div>

            )}

            {/* ==========================================
                MAIN CONTENT
            ========================================== */}

            <main className="author-content">

                {/* TITLE */}

                <div className="dashboard-title">

                    <div>

                        <h2>
                            My Articles
                        </h2>

                        <p>
                            Manage your articles and submissions.
                        </p>

                    </div>

                    <span className="article-count">

                        {articles.length}{" "}

                        {articles.length === 1
                            ? "Article"
                            : "Articles"}

                    </span>

                </div>

                {/* LOADING */}

                {loading && (

                    <div className="dashboard-loading">

                        <div className="loading-spinner"></div>

                        <p>
                            Loading articles...
                        </p>

                    </div>

                )}

                {/* EMPTY */}

                {!loading &&
                    articles.length === 0 && (

                        <div className="empty-articles">

                            <div className="empty-icon">
                                📰
                            </div>

                            <h3>
                                No articles yet
                            </h3>

                            <p>
                                Create your first article
                                to get started.
                            </p>

                            <button
                                onClick={
                                    handleCreateArticle
                                }
                            >
                                + Create Article
                            </button>

                        </div>

                    )}

                {/* ARTICLES */}

                {!loading &&
                    articles.length > 0 && (

                        <div className="articles-table">

                            {/* TABLE HEADER */}

                            <div className="table-header">

                                <span>
                                    Article
                                </span>

                                <span>
                                    Category
                                </span>

                                <span>
                                    Status
                                </span>

                                <span>
                                    Engagement
                                </span>

                                <span>
                                    Actions
                                </span>

                            </div>

                            {/* ARTICLE ROWS */}

                            {articles.map(
                                (article) => {

                                    const articleEngagement =
                                        engagement[
                                            article.id
                                        ] || {

                                            like_count: 0,

                                            comment_count: 0,

                                            share_count: 0

                                        };

                                    return (

                                        <div
                                            className="article-row"
                                            key={article.id}
                                        >

                                            {/* ARTICLE */}

                                            <div className="article-info">

                                                {article.image ? (

                                                    <img
                                                        src={
                                                            article.image.startsWith(
                                                                "http"
                                                            )
                                                                ? article.image
                                                                : `http://127.0.0.1:8000${article.image}`
                                                        }
                                                        alt={
                                                            article.title
                                                        }
                                                    />

                                                ) : (

                                                    <div className="article-image-placeholder">
                                                        📰
                                                    </div>

                                                )}

                                                <div className="article-text">

                                                    <h3>
                                                        {article.title}
                                                    </h3>

                                                    <p>
                                                        {
                                                            article.short_description
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                            {/* CATEGORY */}

                                            <div className="category-cell">

                                                <strong>
                                                    {
                                                        article.category_name ||
                                                        "Unknown Category"
                                                    }
                                                </strong>

                                            </div>

                                            {/* STATUS */}

                                            <div className="status-cell">

                                                <span
                                                    className={
                                                        `status status-${article.status}`
                                                    }
                                                >
                                                    {article.status
                                                        ?.replace(
                                                            "_",
                                                            " "
                                                        )}
                                                </span>

                                            </div>

                                            {/* ==================================
                                                ENGAGEMENT
                                            ================================== */}

                                            <div className="article-engagement">

                                                {article.status ===
                                                "published" ? (

                                                    <>

                                                        {/* LIKE COUNT */}

                                                        <div
                                                            className="engagement-item like"
                                                            title="Total Likes"
                                                        >

                                                            <span className="engagement-icon">
                                                                ❤️
                                                            </span>

                                                            <span className="engagement-number">
                                                                {
                                                                    articleEngagement.like_count
                                                                }
                                                            </span>

                                                        </div>

                                                        {/* COMMENT COUNT */}

                                                        <div
                                                            className="engagement-item comment"
                                                            title="Total Comments"
                                                        >

                                                            <span className="engagement-icon">
                                                                💬
                                                            </span>

                                                            <span className="engagement-number">
                                                                {
                                                                    articleEngagement.comment_count
                                                                }
                                                            </span>

                                                        </div>

                                                        {/* SHARE COUNT */}

                                                        <div
                                                            className="engagement-item share"
                                                            title="Total Shares"
                                                        >

                                                            <span className="engagement-icon">
                                                                🔗
                                                            </span>

                                                            <span className="engagement-number">
                                                                {
                                                                    articleEngagement.share_count
                                                                }
                                                            </span>

                                                        </div>

                                                    </>

                                                ) : (

                                                    <span className="no-engagement">
                                                        —
                                                    </span>

                                                )}

                                            </div>

                                            {/* ACTIONS */}

                                            <div className="article-actions">

                                                {/* VIEW */}

                                                {article.status ===
                                                    "published" && (

                                                    <button
                                                        className="view-btn"
                                                        onClick={() =>
                                                            handleViewArticle(
                                                                article.id
                                                            )
                                                        }
                                                    >
                                                        View Article
                                                    </button>

                                                )}

                                                {/* EDIT */}

                                                {(
                                                    article.status ===
                                                        "draft" ||
                                                    article.status ===
                                                        "rejected"
                                                ) && (

                                                    <button
                                                        className="edit-btn"
                                                        onClick={() =>
                                                            navigate(
                                                                `/add?edit=${article.id}`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                )}

                                                {/* SUBMIT */}

                                                {(
                                                    article.status ===
                                                        "draft" ||
                                                    article.status ===
                                                        "rejected"
                                                ) && (

                                                    <button
                                                        className="submit-btn"
                                                        onClick={() =>
                                                            handleSubmit(
                                                                article.id
                                                            )
                                                        }
                                                    >
                                                        Submit
                                                    </button>

                                                )}

                                                {/* DELETE */}

                                                {(
                                                    article.status ===
                                                        "draft" ||
                                                    article.status ===
                                                        "rejected"
                                                ) && (

                                                    <button
                                                        className="delete-btn"
                                                        onClick={() =>
                                                            handleDelete(
                                                                article.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                )}

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

            </main>

        </div>

    );

}

export default AuthorDashboard;