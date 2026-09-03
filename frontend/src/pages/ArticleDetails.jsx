import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

import {
    getArticle,
    likeArticle,
    getArticleLikeStatus,
    addComment,
    getComments,
    shareArticle,
    getPublicArticleEngagement
} from "../services/api";

import "../components/Navbar.css";
import "./ArticleDetails.css";

const API_URL = "http://127.0.0.1:8000";

function ArticleDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    // ==========================================
    // ARTICLE
    // ==========================================

    const [article, setArticle] = useState(null);
    const [shareCount, setShareCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // LOGIN
    // ==========================================

    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    // ==========================================
    // LIKE
    // ==========================================

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [likeLoading, setLikeLoading] = useState(false);

    // ==========================================
    // SHARE
    // ==========================================

    const [shareLoading, setShareLoading] = useState(false);

    // ==========================================
    // COMMENT
    // ==========================================

    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [showComments, setShowComments] = useState(false);

    // ==========================================
    // CHECK LOGIN
    // ==========================================

    useEffect(() => {

        const checkLogin = () => {

            const token = localStorage.getItem("token");

            setIsLoggedIn(!!token);

        };

        checkLogin();

    }, []);

    // ==========================================
    // LOAD PUBLIC ENGAGEMENT
    // ==========================================

    useEffect(() => {

        const loadEngagement = async () => {

            try {

                const data =
                    await getPublicArticleEngagement(id);

                setLikeCount(
                    data.like_count ?? 0
                );

                setShareCount(
                    data.share_count ?? 0
                );

            } catch (err) {

                console.error(
                    "Engagement loading error:",
                    err
                );

            }

        };

        loadEngagement();

    }, [id]);

    // ==========================================
    // LOAD ARTICLE
    // ==========================================

    useEffect(() => {

        const loadArticle = async () => {

            try {

                setLoading(true);
                setError("");

                const data =
                    await getArticle(id);

                setArticle(data);

                if (data.like_count !== undefined) {

                    setLikeCount(
                        data.like_count
                    );

                }

            } catch (err) {

                console.error(
                    "Failed to load article:",
                    err
                );

                setError(
                    "Unable to load article."
                );

            } finally {

                setLoading(false);

            }

        };

        loadArticle();

    }, [id]);

    // ==========================================
    // LOAD LIKE STATUS
    // ==========================================

    useEffect(() => {

        const loadLikeStatus = async () => {

            const token =
                localStorage.getItem("token");

            if (!token) {

                setLiked(false);

                return;

            }

            try {

                const data =
                    await getArticleLikeStatus(id);

                setLiked(
                    data.liked ?? false
                );

                setLikeCount(
                    data.like_count ?? 0
                );

            } catch (err) {

                console.error(
                    "Like status error:",
                    err
                );

            }

        };

        loadLikeStatus();

    }, [id, isLoggedIn]);

    // ==========================================
    // LOAD COMMENTS
    // ==========================================

    useEffect(() => {

        const loadComments = async () => {

            try {

                const data =
                    await getComments(id);

                setComments(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (err) {

                console.error(
                    "Comments loading error:",
                    err
                );

            }

        };

        loadComments();

    }, [id]);

    // ==========================================
    // LIKE ARTICLE
    // ==========================================

    const handleLike = async () => {

        if (!isLoggedIn) {
            return;
        }

        if (likeLoading) {
            return;
        }

        try {

            setLikeLoading(true);

            const data =
                await likeArticle(id);

            setLiked(
                data.liked ?? !liked
            );

            setLikeCount(
                data.like_count ?? likeCount
            );

        } catch (err) {

            console.error(
                "Like error:",
                err
            );

        } finally {

            setLikeLoading(false);

        }

    };

    // ==========================================
    // SHARE ARTICLE
    // ==========================================

    const handleShare = async () => {

        if (!isLoggedIn) {
            return;
        }

        if (shareLoading) {
            return;
        }

        try {

            setShareLoading(true);

            // Save share in database
            const data =
                await shareArticle(id);

            // Keep updated internally.
            // It is NOT displayed to the user.
            setShareCount(
                data.share_count ?? shareCount
            );

            const shareData = {

                title:
                    article?.title ||
                    "Article",

                text:
                    article?.short_description ||
                    "Check out this article.",

                url:
                    window.location.href

            };

            // Browser share
            if (navigator.share) {

                try {

                    await navigator.share(
                        shareData
                    );

                } catch (shareError) {

                    console.log(
                        "Browser share cancelled."
                    );

                }

            } else {

                // Fallback
                await navigator.clipboard.writeText(
                    window.location.href
                );

                alert(
                    "Article link copied!"
                );

            }

        } catch (err) {

            console.error(
                "Share error:",
                err
            );

            alert(
                err.response?.data?.detail ||
                "Unable to share article."
            );

        } finally {

            setShareLoading(false);

        }

    };

    // ==========================================
    // ADD COMMENT
    // ==========================================

    const handleComment = async () => {

        if (!isLoggedIn) {
            return;
        }

        if (!commentText.trim()) {

            alert(
                "Please enter a comment."
            );

            return;

        }

        try {

            setCommentLoading(true);

            const newComment =
                await addComment(
                    id,
                    commentText.trim()
                );

            setComments(
                (previous) => [
                    newComment,
                    ...previous
                ]
            );

            setCommentText("");

            setShowComments(true);

        } catch (err) {

            console.error(
                "Comment error:",
                err
            );

            alert(
                "Unable to add comment."
            );

        } finally {

            setCommentLoading(false);

        }

    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <>
                <Navbar />

                <div className="article-details-loading with-sidebar">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading article...
                    </p>

                </div>
            </>
        );

    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error || !article) {

        return (
            <>
                <Navbar />

                <main className="article-error-page with-sidebar">

                    <div className="article-error-box">

                        <h1>
                            Article Not Found
                        </h1>

                        <p>
                            The article you are looking for
                            could not be found.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/")
                            }
                        >
                            ← Back to Home
                        </button>

                    </div>

                </main>
            </>
        );

    }

    // ==========================================
    // IMAGE URL
    // ==========================================

    const imageUrl = article.image
        ? article.image.startsWith("http")
            ? article.image
            : `${API_URL}${article.image}`
        : null;

    // ==========================================
    // DATE
    // ==========================================

    let formattedDate = "";

    if (article.published_date) {

        const date =
            new Date(
                article.published_date
            );

        if (!isNaN(date.getTime())) {

            formattedDate =
                date.toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );

        }

    }

    // ==========================================
    // ARTICLE PAGE
    // ==========================================

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

                    {/* ==========================================
                        USER ACTIONS
                        ONLY LOGGED-IN USERS
                    ========================================== */}

                    {isLoggedIn && (

                        <div className="article-actions">

                            {/* LIKE */}

                            <button
                                className={`article-action-btn ${
                                    liked ? "liked" : ""
                                }`}
                                onClick={handleLike}
                                disabled={likeLoading}
                            >

                                <span>
                                    {liked ? "❤️" : "🤍"}
                                </span>

                                <span>
                                    {liked ? "Liked" : "Like"}
                                </span>

                                <span className="action-count">
                                    {likeCount}
                                </span>

                            </button>

                            {/* COMMENT */}

                            <button
                                className="article-action-btn"
                                onClick={() =>
                                    setShowComments(
                                        !showComments
                                    )
                                }
                            >

                                <span>
                                    💬
                                </span>

                                <span>
                                    Comment
                                </span>

                                <span className="action-count">
                                    {comments.length}
                                </span>

                            </button>

                            {/* SHARE */}

                            <button
                                className="article-action-btn"
                                onClick={handleShare}
                                disabled={shareLoading}
                            >

                                <span>
                                    ↗
                                </span>

                                <span>
                                    {shareLoading
                                        ? "Sharing..."
                                        : "Share"}
                                </span>

                                {/* IMPORTANT:
                                    NO SHARE COUNT HERE
                                */}

                            </button>

                        </div>

                    )}

                    {/* ==========================================
                        COMMENTS
                        ONLY LOGGED-IN USERS
                    ========================================== */}

                    {isLoggedIn && showComments && (

                        <div className="comments-section">

                            <h2>
                                Comments
                            </h2>

                            {/* COMMENT FORM */}

                            <div className="comment-form">

                                <textarea
                                    value={commentText}
                                    onChange={(e) =>
                                        setCommentText(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Write your comment..."
                                    rows="4"
                                />

                                <button
                                    onClick={handleComment}
                                    disabled={commentLoading}
                                >

                                    {commentLoading
                                        ? "Posting..."
                                        : "Post Comment"}

                                </button>

                            </div>

                            {/* COMMENTS LIST */}

                            <div className="comments-list">

                                {comments.length === 0 ? (

                                    <p className="no-comments">
                                        No comments yet.
                                        Be the first to comment.
                                    </p>

                                ) : (

                                    comments.map((comment) => (

                                        <div
                                            className="comment-card"
                                            key={comment.id}
                                        >

                                            <div className="comment-header">

                                                <strong>
                                                    {
                                                        comment.user_name ||
                                                        comment.author ||
                                                        "User"
                                                    }
                                                </strong>

                                            </div>

                                            <p>
                                                {
                                                    comment.comment ||
                                                    comment.content
                                                }
                                            </p>

                                            {comment.created_at && (

                                                <small>
                                                    {new Date(
                                                        comment.created_at
                                                    ).toLocaleDateString(
                                                        "en-IN"
                                                    )}
                                                </small>

                                            )}

                                        </div>

                                    ))

                                )}

                            </div>

                        </div>

                    )}

                    {/* FOOTER */}

                    <div className="article-details-footer">

                        <button
                            className="back-to-articles"
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