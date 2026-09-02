import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import {
  getArticles,
  getCategories,
} from "../services/api";

import "./Home.css";

function Home() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentSlide, setCurrentSlide] = useState(0);

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError("");

      const [categoryData, articleData] = await Promise.all([
        getCategories(),
        getArticles(),
      ]);

      setCategories(
        Array.isArray(categoryData) ? categoryData : []
      );

      setArticles(
        Array.isArray(articleData) ? articleData : []
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

  // ==========================================
  // IMAGE
  // ==========================================

  const getArticleImage = (article) => {
    if (!article?.image) {
      return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=85";
    }

    if (article.image.startsWith("http")) {
      return article.image;
    }

    return `http://127.0.0.1:8000${article.image}`;
  };

  // ==========================================
  // CATEGORY
  // ==========================================

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) => item.id === categoryId
    );

    return category?.name || "General";
  };

  // ==========================================
  // DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // FEATURED + LATEST
  // ==========================================

  const featuredArticle = articles[0];

  const latestArticles = articles.slice(1);

  const carouselArticles = latestArticles.slice(0, 6);

  // ==========================================
  // CAROUSEL
  // ==========================================

  const nextSlide = () => {
    if (!carouselArticles.length) return;

    setCurrentSlide((prev) =>
      prev === carouselArticles.length - 1 ? 0 : prev + 1
    );
  };

  const previousSlide = () => {
    if (!carouselArticles.length) return;

    setCurrentSlide((prev) =>
      prev === 0 ? carouselArticles.length - 1 : prev - 1
    );
  };

  // ==========================================
  // AUTO CAROUSEL
  // ==========================================

  useEffect(() => {
    if (!carouselArticles.length) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === carouselArticles.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [carouselArticles.length]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="home-page">
          <div className="loading-box">
            <div className="loading-spinner"></div>
            <p>Loading latest news...</p>
          </div>
        </main>
      </>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <>
        <Navbar />

        <main className="home-page">
          <div className="error-box">
            <h2>Something went wrong</h2>

            <p>{error}</p>

            <button onClick={loadHomeData}>
              Try Again
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="home-page">

        {/* ======================================
            TOP HEADER
        ====================================== */}

        <section className="news-header">

          <div>
            <span className="eyebrow">
              DAILY NEWS
            </span>

            <h1>
              Stay Informed.
              <br />
              Stay Ahead.
            </h1>

            <p>
              Latest stories, ideas and information
              from around the world.
            </p>
          </div>

          <div className="header-date">
            <span>Today</span>
            <strong>
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </strong>
          </div>

        </section>


        {/* ======================================
            FEATURED NEWS
        ====================================== */}

        {featuredArticle && (
          <section className="featured-section">

            <div className="section-title-row">

              <div>
                <span className="section-label">
                  TOP STORY
                </span>

                <h2>Featured News</h2>
              </div>

              <Link
                to="/articles"
                className="view-all"
              >
                View All →
              </Link>

            </div>


            <div className="featured-card">

              <Link
                to={`/articles/${featuredArticle.id}`}
                className="featured-image"
              >

                <img
                  src={getArticleImage(featuredArticle)}
                  alt={featuredArticle.title}
                />

                <span className="featured-badge">
                  {getCategoryName(
                    featuredArticle.category_id
                  )}
                </span>

              </Link>


              <div className="featured-content">

                <div className="article-meta">

                  <span>
                    {featuredArticle.author ||
                      "Article Team"}
                  </span>

                  {featuredArticle.published_date && (
                    <>
                      <span>•</span>

                      <span>
                        {formatDate(
                          featuredArticle.published_date
                        )}
                      </span>
                    </>
                  )}

                </div>


                <h2>
                  {featuredArticle.title}
                </h2>


                <p>
                  {featuredArticle.short_description}
                </p>


                <Link
                  to={`/articles/${featuredArticle.id}`}
                  className="primary-read"
                >
                  Read Full Article
                  <span>→</span>
                </Link>

              </div>

            </div>

          </section>
        )}


        {/* ======================================
            LATEST NEWS CAROUSEL
        ====================================== */}

        {carouselArticles.length > 0 && (
          <section className="latest-section">

            <div className="section-title-row">

              <div>
                <span className="section-label">
                  JUST IN
                </span>

                <h2>Latest News</h2>
              </div>


              <div className="carousel-controls">

                <button
                  onClick={previousSlide}
                  aria-label="Previous news"
                >
                  ←
                </button>

                <button
                  onClick={nextSlide}
                  aria-label="Next news"
                >
                  →
                </button>

              </div>

            </div>


            <div className="latest-carousel">

              {carouselArticles.map((article, index) => {

                const position =
                  index - currentSlide;

                return (
                  <article
                    className={`latest-card ${
                      position === 0
                        ? "active"
                        : ""
                    }`}
                    key={article.id}
                    style={{
                      transform: `translateX(calc(${position} * (100% + 24px)))`,
                    }}
                  >

                    <Link
                      to={`/articles/${article.id}`}
                      className="latest-image"
                    >

                      <img
                        src={getArticleImage(article)}
                        alt={article.title}
                      />

                      <span>
                        {getCategoryName(
                          article.category_id
                        )}
                      </span>

                    </Link>


                    <div className="latest-content">

                      <div className="article-meta">

                        <span>
                          {article.author ||
                            "Article Team"}
                        </span>

                        <span>•</span>

                        <span>
                          {formatDate(
                            article.published_date
                          )}
                        </span>

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
                        className="small-read"
                      >
                        Read Story →
                      </Link>

                    </div>

                  </article>
                );
              })}

            </div>


            <div className="carousel-dots">

              {carouselArticles.map(
                (article, index) => (
                  <button
                    key={article.id}
                    className={
                      index === currentSlide
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setCurrentSlide(index)
                    }
                    aria-label={`Go to slide ${
                      index + 1
                    }`}
                  />
                )
              )}

            </div>

          </section>
        )}


        {/* ======================================
            ALL LATEST ARTICLES
        ====================================== */}

        {latestArticles.length > 0 && (
          <section className="all-news-section">

            <div className="section-title-row">

              <div>
                <span className="section-label">
                  DISCOVER
                </span>

                <h2>More News</h2>
              </div>

              <Link
                to="/articles"
                className="view-all"
              >
                All Articles →
              </Link>

            </div>


            <div className="news-grid">

              {latestArticles.slice(0, 9).map(
                (article) => (

                  <article
                    className="news-card"
                    key={article.id}
                  >

                    <Link
                      to={`/articles/${article.id}`}
                      className="news-card-image"
                    >

                      <img
                        src={getArticleImage(article)}
                        alt={article.title}
                      />

                      <span>
                        {getCategoryName(
                          article.category_id
                        )}
                      </span>

                    </Link>


                    <div className="news-card-content">

                      <div className="article-meta">

                        <span>
                          {article.author ||
                            "Article Team"}
                        </span>

                        <span>•</span>

                        <span>
                          {formatDate(
                            article.published_date
                          )}
                        </span>

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
                        className="small-read"
                      >
                        Read Article →
                      </Link>

                    </div>

                  </article>

                )
              )}

            </div>

          </section>
        )}


        {/* ======================================
            EMPTY
        ====================================== */}

        {!articles.length && (
          <div className="empty-box">

            <div>📰</div>

            <h2>No Articles Yet</h2>

            <p>
              Articles will appear here once
              they are published.
            </p>

          </div>
        )}

      </main>


      {/* ======================================
          FOOTER
      ====================================== */}

      <footer className="home-footer">

        <div className="footer-inner">

          <div>
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
          © {new Date().getFullYear()} Article.
          All rights reserved.
        </div>

      </footer>

    </>
  );
}

export default Home;