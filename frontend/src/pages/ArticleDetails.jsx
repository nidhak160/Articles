import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getArticle } from "../services/api";
import "../components/Navbar.css";
import "./ArticleDetails.css";

const API_URL = "http://127.0.0.1:8000";

function ArticleDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadArticle = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getArticle(id);

                setArticle(data);
            } catch (err) {
                console.error("Failed to load article:", err);

                setError("Unable to load article.");
            } finally {
                setLoading(false);
            }
        };

        loadArticle();
    }, [id]);

    // -----------------------------------------
    // LOADING
    // -----------------------------------------

    if (loading) {
        return (
            <>
                <Navbar />

                <div className="article-details-loading with-sidebar">
                    <div className="loading-spinner"></div>
                    <p>Loading article...</p>
                </div>
            </>
        );
    }

    // -----------------------------------------
    // ERROR
    // -----------------------------------------

    if (error || !article) {
        return (
            <>
                <Navbar />

                <main className="article-error-page with-sidebar">
                    <div className="article-error-box">
                        <h1>Article Not Found</h1>

                        <p>
                            The article you are looking for could not be
                            found.
                        </p>

                        <button
                            onClick={() => navigate("/")}
                        >
                            ← Back to Home
                        </button>
                    </div>
                </main>
            </>
        );
    }

    // -----------------------------------------
    // IMAGE URL
    // -----------------------------------------

    const imageUrl = article.image
        ? article.image.startsWith("http")
            ? article.image
            : `${API_URL}${article.image}`
        : null;

    // -----------------------------------------
    // DATE
    // -----------------------------------------

    let formattedDate = "";

    if (article.published_date) {
        const date = new Date(article.published_date);

        if (!isNaN(date.getTime())) {
            formattedDate = date.toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                }
            );
        }
    }

    // -----------------------------------------
    // ARTICLE PAGE
    // -----------------------------------------

    return (
        <>
            <Navbar />

            <main className="article-details-page with-sidebar">

                {/* BACK BUTTON */}

                <button
                    className="article-back-button"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>


                <article className="article-details-container">

                    {/* CATEGORY */}

                    {article.category && (
                        <div className="article-category">
                            {article.category.name}
                        </div>
                    )}


                    {/* TITLE */}

                    <h1 className="article-details-title">
                        {article.title}
                    </h1>


                    {/* SHORT DESCRIPTION */}

                    {article.short_description && (
                        <p className="article-details-short-description">
                            {article.short_description}
                        </p>
                    )}


                    {/* META */}

                    <div className="article-details-meta">

                        {article.author && (
                            <span>
                                By{" "}
                                <strong>
                                    {article.author}
                                </strong>
                            </span>
                        )}

                        {formattedDate && (
                            <>
                                <span className="meta-dot">
                                    •
                                </span>

                                <span>
                                    {formattedDate}
                                </span>
                            </>
                        )}

                    </div>


                    {/* IMAGE */}

                    {imageUrl && (
                        <div className="article-details-image-wrapper">

                            <img
                                src={imageUrl}
                                alt={article.title}
                                className="article-details-image"
                            />

                        </div>
                    )}


                    {/* FULL CONTENT */}

                    <div className="article-details-content">

                        {article.content ? (
                            article.content
                                .split("\n")
                                .map((paragraph, index) => {

                                    if (!paragraph.trim()) {
                                        return (
                                            <div
                                                key={index}
                                                className="content-space"
                                            />
                                        );
                                    }

                                    return (
                                        <p key={index}>
                                            {paragraph}
                                        </p>
                                    );
                                })
                        ) : (
                            <p>
                                No full article content available.
                            </p>
                        )}

                    </div>


                    {/* BOTTOM */}

                    <div className="article-details-footer">

                        <button className="back-to-articles"
                            onClick={() => navigate("/")}
                        >
                            ← Back to Articles
                        </button>

                    </div>

                </article>

            </main>
        </>
    );
}

export default ArticleDetails;