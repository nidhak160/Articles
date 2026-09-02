import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getMyArticles,
    submitArticle,
    deleteArticle
} from "../services/api";

import "./AuthorDashboard.css";


function AuthorDashboard() {

    const navigate = useNavigate();


    const [articles, setArticles] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );


    // ==========================================
    // LOAD MY ARTICLES
    // ==========================================

    const loadArticles = async () => {

        try {

            setLoading(true);

            const data = await getMyArticles();

            setArticles(data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to load articles."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadArticles();

    }, []);


    // ==========================================
    // SUBMIT
    // ==========================================

    const handleSubmit = async (id) => {

        try {

            await submitArticle(id);

            alert(
                "Article submitted for review."
            );

            loadArticles();

        } catch (err) {

            alert(
                err.response?.data?.detail ||
                "Unable to submit article."
            );

        }
    };


    // ==========================================
    // DELETE
    // ==========================================

    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this article?"
        );


        if (!confirmDelete) {
            return;
        }


        try {

            await deleteArticle(id);

            loadArticles();

        } catch (err) {

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


    return (

        <div className="author-dashboard">


            {/* ==================================
                HEADER
            ================================== */}

            <header className="author-header">

                <div>

                    <h1>
                        Author Dashboard
                    </h1>

                    <p>
                        Welcome, {user?.name}
                    </p>

                </div>


                <div className="author-header-actions">

                    <button
                        className="create-btn"
                        onClick={() => navigate("/add")}
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


            {/* ==================================
                ERROR
            ================================== */}

            {error && (

                <div className="dashboard-error">
                    {error}
                </div>

            )}


            {/* ==================================
                CONTENT
            ================================== */}

            <main className="author-content">

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
                        {articles.length} Articles
                    </span>

                </div>


                {/* LOADING */}

                {loading && (

                    <div className="dashboard-loading">
                        Loading articles...
                    </div>

                )}


                {/* EMPTY */}

                {!loading && articles.length === 0 && (

                    <div className="empty-articles">

                        <h3>
                            No articles yet
                        </h3>

                        <p>
                            Create your first article to get started.
                        </p>

                        <button
                            onClick={() => navigate("/add")}
                        >
                            Create Article
                        </button>

                    </div>

                )}


                {/* ARTICLES */}

                {!loading && articles.length > 0 && (

                    <div className="articles-table">

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
                                Actions
                            </span>

                        </div>


                        {articles.map((article) => (

                            <div
                                className="article-row"
                                key={article.id}
                            >


                                {/* ARTICLE */}

                                <div className="article-info">

                                    {article.image && (

                                        <img
                                            src={
                                                article.image.startsWith("http")
                                                    ? article.image
                                                    : `http://127.0.0.1:8000${article.image}`
                                            }
                                            alt={article.title}
                                        />

                                    )}

                                    <div>

                                        <h3>
                                            {article.title}
                                        </h3>

                                        <p>
                                            {article.short_description}
                                        </p>

                                    </div>

                                </div>


                                {/* CATEGORY */}

                                <div>
                                    <strong>
                                        {article.category_name || "Unknown Category"}
                                    </strong>

                                </div>


                                {/* STATUS */}

                                <div>

                                    <span
                                        className={`status status-${article.status}`}
                                    >
                                        {article.status.replace(
                                            "_",
                                            " "
                                        )}
                                    </span>

                                </div>


                                {/* ACTIONS */}

                                <div className="article-actions">


                                    {/* EDIT */}

                                    {(article.status === "draft" ||
                                        article.status === "rejected") && (

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

                                    {(article.status === "draft" ||
                                        article.status === "rejected") && (

                                        <button
                                            className="submit-btn"
                                            onClick={() =>
                                                handleSubmit(article.id)
                                            }
                                        >
                                            Submit
                                        </button>

                                    )}


                                    {/* DELETE */}

                                    {(article.status === "draft" ||
                                        article.status === "rejected") && (

                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                handleDelete(article.id)
                                            }
                                        >
                                            Delete
                                        </button>

                                    )}

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </main>

        </div>
    );
}


export default AuthorDashboard;