import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategories, getArticlesByCategory } from "../services/api";
import Navbar from "../components/Navbar";
import "./Category.css";

function Category() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState(null);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const categories = await getCategories();

                const selectedCategory = categories.find(
                    (item) => item.id === Number(id)
                );

                setCategory(selectedCategory);

                const articleData =
                    await getArticlesByCategory(id);

                setArticles(articleData);
            } catch (error) {
                console.error("Category error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Navbar />

            <main className="category-page">

                <h1>
                    {category?.name || "Category"}
                </h1>

                <div className="article-grid">

                    {articles.length === 0 ? (
                        <p>No articles found.</p>
                    ) : (
                        articles.map((article) => (

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
                                        Read More
                                    </button>

                                </div>

                            </div>

                        ))
                    )}

                </div>

            </main>
        </>
    );
}

export default Category;