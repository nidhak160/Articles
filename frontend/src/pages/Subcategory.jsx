import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getArticlesBySubcategory } from "../services/api";
import Navbar from "../components/Navbar";
import "./Subcategory.css";

function Subcategory() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadArticles = async () => {
            try {
                const data = await getArticlesBySubcategory(id);
                setArticles(data);
            } catch (error) {
                console.error("Failed to load subcategory articles:", error);
            } finally {
                setLoading(false);
            }
        };

        loadArticles();
    }, [id]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="subcategory-loading">
                    Loading articles...
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="subcategory-page">

                <h1>Articles</h1>

                {articles.length === 0 ? (
                    <div className="no-articles">
                        <h2>No articles found</h2>
                    </div>
                ) : (
                    <div className="article-grid">

                        {articles.map((article) => (
                            <div
                                className="article-card"
                                key={article.id}
                            >

                                {article.image && (
                                    <img
                                        src={`http://127.0.0.1:8000${article.image}`}
                                        alt={article.title}
                                    />
                                )}

                                <div className="article-card-content">

                                    <h2>
                                        {article.title}
                                    </h2>

                                    <p>
                                        {article.short_description}
                                    </p>

                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/article/${article.id}`
                                            )
                                        }
                                    >
                                        Read More →
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </main>
        </>
    );
}

export default Subcategory;