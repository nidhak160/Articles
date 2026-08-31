import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import {
  getArticles,
  getCategories,
} from "../services/api";

import "./Home.css";


function Home() {

  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    loadHomeData();
  }, []);


  const loadHomeData = async () => {

    try {

      setLoading(true);
      setError("");

      const [categoryData, articleData] =
        await Promise.all([
          getCategories(),
          getArticles(),
        ]);


      setCategories(
        Array.isArray(categoryData)
          ? categoryData
          : []
      );


      setArticles(
        Array.isArray(articleData)
          ? articleData
          : []
      );

    } catch (err) {

      console.error(err);

      setError(
        "Unable to load articles. Please check that your FastAPI server is running."
      );

    } finally {

      setLoading(false);

    }
  };


  /* ======================================
     IMAGE
  ====================================== */

  const getArticleImage = (article) => {

    if (!article.image) {

      return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000&q=80";

    }


    if (article.image.startsWith("http")) {

      return article.image;

    }


    return `http://127.0.0.1:8000${article.image}`;

  };


  /* ======================================
     CATEGORY NAME
  ====================================== */

  const getCategoryName = (categoryId) => {

    const category = categories.find(
      (item) => item.id === categoryId
    );

    return category?.name || "General";

  };


  /* ======================================
     DATE
  ====================================== */

  const formatDate = (date) => {

    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {

      return date;

    }


    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  const featuredArticle = articles[0];

  const latestArticles = articles.slice(1, 7);


  return (

    <>

      {/* ==================================
          FIXED NAVBAR + SIDEBAR
      ================================== */}

      <Navbar />


      {/* ==================================
          PAGE CONTENT

          IMPORTANT:
          page-with-sidebar handles
          navbar + sidebar spacing
      ================================== */}

      <main className="page-with-sidebar home-page">


        {/* ==================================
            ERROR
        ================================== */}

        {error && (

          <div className="home-error">

            <strong>
              Something went wrong
            </strong>

            <p>
              {error}
            </p>

            <button onClick={loadHomeData}>
              Try Again
            </button>

          </div>

        )}


        {/* ==================================
            LOADING
        ================================== */}

        {loading ? (

          <div className="loading-container">

            <div className="loading-spinner"></div>

            <p>
              Loading articles...
            </p>

          </div>

        ) : (

          <>


            {/* ==================================
                HERO
            ================================== */}

            {featuredArticle && (

              <section className="hero-section">

                <div className="section-heading">

                  <div>

                    <span className="section-label">
                      TOP STORY
                    </span>

                    <h1>
                      Latest Stories
                    </h1>

                  </div>

                </div>


                <div className="hero-grid">


                  {/* IMAGE */}

                  <div className="hero-image-wrapper">

                    <img
                      src={getArticleImage(
                        featuredArticle
                      )}
                      alt={featuredArticle.title}
                      className="hero-image"
                    />


                    <div className="hero-image-overlay"></div>


                    <div className="hero-category-badge">

                      {getCategoryName(
                        featuredArticle.category_id
                      )}

                    </div>

                  </div>


                  {/* CONTENT */}

                  <div className="hero-content">

                    <span className="article-meta">

                      {featuredArticle.author ||
                        "Article Team"}

                      {featuredArticle.published_date && (

                        <>

                          <span>•</span>

                          {formatDate(
                            featuredArticle.published_date
                          )}

                        </>

                      )}

                    </span>


                    <h2>
                      {featuredArticle.title}
                    </h2>


                    <p>
                      {featuredArticle.short_description}
                    </p>


                    <Link
                      to={`/articles/${featuredArticle.id}`}
                      className="read-more"
                    >

                      Read Full Article

                      <span>→</span>

                    </Link>

                  </div>

                </div>

              </section>

            )}


            {/* ==================================
                CATEGORIES
            ================================== */}

            {categories.length > 0 && (

              <section className="category-section">

                <div className="section-heading compact">

                  <div>

                    <span className="section-label">
                      EXPLORE
                    </span>

                    <h2>
                      Categories
                    </h2>

                  </div>

                </div>


                <div className="category-grid">

                  {categories.map((category) => (

                    <Link
                      to={`/category/${category.id}`}
                      className="category-card"
                      key={category.id}
                    >

                      <div className="category-card-content">

                        <span className="category-number">

                          {String(category.id)
                            .padStart(2, "0")}

                        </span>


                        <h3>
                          {category.name}
                        </h3>


                        {category.subcategories &&
                          category.subcategories.length > 0 && (

                            <span className="subcategory-count">

                              {category.subcategories.length}

                              {" "}
                              subcategories

                            </span>

                          )}

                      </div>


                      <span className="category-arrow">
                        →
                      </span>

                    </Link>

                  ))}

                </div>

              </section>

            )}


            {/* ==================================
                LATEST ARTICLES
            ================================== */}

            {latestArticles.length > 0 && (

              <section className="latest-section">

                <div className="section-heading">

                  <div>

                    <span className="section-label">
                      DISCOVER
                    </span>

                    <h2>
                      Latest Articles
                    </h2>

                  </div>


                  <Link
                    to="/articles"
                    className="view-all"
                  >
                    View All →
                  </Link>

                </div>


                <div className="article-grid">

                  {latestArticles.map((article) => (

                    <article
                      className="article-card"
                      key={article.id}
                    >


                      {/* IMAGE */}

                      <Link
                        to={`/articles/${article.id}`}
                        className="article-image-link"
                      >

                        <img
                          src={getArticleImage(article)}
                          alt={article.title}
                          className="article-image"
                        />


                        <span className="article-category">

                          {getCategoryName(
                            article.category_id
                          )}

                        </span>

                      </Link>


                      {/* CONTENT */}

                      <div className="article-content">

                        <div className="article-info">

                          <span>

                            {article.author ||
                              "Article Team"}

                          </span>


                          {article.published_date && (

                            <>

                              <span>
                                •
                              </span>

                              <span>

                                {formatDate(
                                  article.published_date
                                )}

                              </span>

                            </>

                          )}

                        </div>


                        <h3>

                          <Link
                            to={`/articles/${article.id}`}
                          >

                            {article.title}

                          </Link>

                        </h3>


                        <p>
                          {article.short_description}
                        </p>


                        <Link
                          to={`/articles/${article.id}`}
                          className="card-read-more"
                        >

                          Read Article

                          <span>
                            →
                          </span>

                        </Link>

                      </div>

                    </article>

                  ))}

                </div>

              </section>

            )}


            {/* ==================================
                CATEGORY ARTICLES
            ================================== */}

            {categories.map((category) => {

              const categoryArticles =
                articles.filter(
                  (article) =>
                    article.category_id ===
                    category.id
                );


              if (!categoryArticles.length) {

                return null;

              }


              return (

                <section
                  className="category-articles-section"
                  key={category.id}
                >


                  <div className="section-heading">

                    <div>

                      <span className="section-label">
                        CATEGORY
                      </span>

                      <h2>
                        {category.name}
                      </h2>

                    </div>


                    <Link
                      to={`/category/${category.id}`}
                      className="view-all"
                    >

                      View All →

                    </Link>

                  </div>


                  <div className="category-articles-grid">

                    {categoryArticles
                      .slice(0, 3)
                      .map((article) => (

                        <article
                          className="small-article-card"
                          key={article.id}
                        >

                          <img
                            src={getArticleImage(article)}
                            alt={article.title}
                          />


                          <div>

                            <span className="small-article-meta">

                              {formatDate(
                                article.published_date
                              )}

                            </span>


                            <h3>

                              <Link
                                to={`/articles/${article.id}`}
                              >

                                {article.title}

                              </Link>

                            </h3>


                            <p>

                              {article.short_description}

                            </p>

                          </div>

                        </article>

                      ))}

                  </div>

                </section>

              );

            })}


            {/* ==================================
                EMPTY
            ================================== */}

            {!articles.length && !error && (

              <div className="empty-state">

                <div className="empty-icon">
                  📰
                </div>

                <h2>
                  No Articles Yet
                </h2>

                <p>
                  Articles will appear here once
                  they are published.
                </p>

              </div>

            )}

          </>

        )}

      </main>


      {/* ==================================
          FOOTER
      ================================== */}

      <footer className="home-footer">

        <div className="footer-container">

          <div className="footer-brand">

            <div className="footer-logo">

              <span>A</span>

              ARTICLE

            </div>


            <p>
              Your source for stories, ideas and
              information.
            </p>

          </div>


          <div className="footer-links">

            <Link to="/">
              Home
            </Link>

            <Link to="/articles">
              Articles
            </Link>

            <Link to="/categories">
              Categories
            </Link>

            <Link to="/about">
              About
            </Link>

          </div>

        </div>


        <div className="footer-bottom">

          <p>

            © {new Date().getFullYear()}
            {" "}
            Article.
            {" "}
            All rights reserved.

          </p>

        </div>

      </footer>

    </>

  );

}


export default Home;