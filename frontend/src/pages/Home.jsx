import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";

import {
  getArticles,
  getCategories,
} from "../services/api";

import "./Home.css";


function Home() {

  // ==========================================
  // STATE
  // ==========================================

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentSlide, setCurrentSlide] = useState(0);


  // ==========================================
  // LOAD HOME DATA
  // ==========================================

  useEffect(() => {
    loadHomeData();
  }, []);


  const loadHomeData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        categoryData,
        articleData
      ] = await Promise.all([
        getCategories(),
        getArticles(),
      ]);


      // Categories

      setCategories(
        Array.isArray(categoryData)
          ? categoryData
          : []
      );


      // Articles

      setArticles(
        Array.isArray(articleData)
          ? articleData
          : []
      );


    } catch (err) {

      console.error(
        "Home data loading error:",
        err
      );

      setError(
        "Unable to load articles. Please check that your FastAPI server is running."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // ARTICLE IMAGE
  // ==========================================

  const getArticleImage = (article) => {

    if (!article?.image) {

      return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=85";

    }


    if (
      article.image.startsWith("http")
    ) {

      return article.image;

    }


    return `http://127.0.0.1:8000${article.image}`;

  };


  // ==========================================
  // CATEGORY NAME
  // ==========================================

  const getCategoryName = (article) => {

    if (!article) {
      return "";
    }


    // ------------------------------------------
    // OPTION 1
    // Backend returns:
    //
    // category: {
    //   id: 1,
    //   name: "Technology"
    // }
    // ------------------------------------------

    if (
      article.category &&
      typeof article.category === "object" &&
      article.category.name
    ) {

      return article.category.name;

    }


    // ------------------------------------------
    // OPTION 2
    // Backend returns:
    //
    // category_name: "Technology"
    // ------------------------------------------

    if (article.category_name) {

      return article.category_name;

    }


    // ------------------------------------------
    // OPTION 3
    // Backend returns:
    //
    // category_id: 2
    // ------------------------------------------

    if (
      article.category_id !== undefined &&
      article.category_id !== null
    ) {

      const category = categories.find(
        (item) =>
          Number(item.id) ===
          Number(article.category_id)
      );


      if (category?.name) {

        return category.name;

      }

    }


    // ------------------------------------------
    // NO CATEGORY
    // Don't show GENERAL
    // ------------------------------------------

    return "";

  };


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {

    if (!date) {
      return "";
    }


    const parsedDate = new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

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


  // ==========================================
  // FEATURED ARTICLE
  // ==========================================

  const featuredArticle =
    articles.length > 0
      ? articles[0]
      : null;


  // ==========================================
  // LATEST ARTICLES
  // ==========================================

  const latestArticles =
    articles.slice(1);


  // ==========================================
  // CAROUSEL ARTICLES
  // ==========================================

  const carouselArticles =
    latestArticles.slice(0, 6);


  // ==========================================
  // RESET SLIDE
  // ==========================================

  useEffect(() => {

    if (
      currentSlide >=
      carouselArticles.length
    ) {

      setCurrentSlide(0);

    }

  }, [
    carouselArticles.length,
    currentSlide
  ]);


  // ==========================================
  // NEXT SLIDE
  // ==========================================

  const nextSlide = () => {

    if (!carouselArticles.length) {
      return;
    }


    setCurrentSlide(
      (previous) => {

        if (
          previous ===
          carouselArticles.length - 1
        ) {

          return 0;

        }

        return previous + 1;

      }
    );

  };


  // ==========================================
  // PREVIOUS SLIDE
  // ==========================================

  const previousSlide = () => {

    if (!carouselArticles.length) {
      return;
    }


    setCurrentSlide(
      (previous) => {

        if (previous === 0) {

          return (
            carouselArticles.length - 1
          );

        }

        return previous - 1;

      }
    );

  };


  // ==========================================
  // AUTO CAROUSEL
  // ==========================================

  useEffect(() => {

    if (
      carouselArticles.length <= 1
    ) {

      return;

    }


    const timer = setInterval(() => {

      setCurrentSlide(
        (previous) => {

          if (
            previous ===
            carouselArticles.length - 1
          ) {

            return 0;

          }

          return previous + 1;

        }
      );

    }, 5000);


    return () => {

      clearInterval(timer);

    };

  }, [
    carouselArticles.length
  ]);


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

            <p>
              Loading latest news...
            </p>

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

            <h2>
              Something went wrong
            </h2>

            <p>
              {error}
            </p>

            <button
              onClick={loadHomeData}
            >
              Try Again
            </button>

          </div>

        </main>
      </>
    );

  }


  // ==========================================
  // PAGE
  // ==========================================

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
              Latest stories, ideas and
              information from around the world.
            </p>

          </div>


          <div className="header-date">

            <span>
              Today
            </span>

            <strong>

              {new Date().toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }
              )}

            </strong>

          </div>

        </section>



        {/* ======================================
            FEATURED NEWS
        ====================================== */}

        {featuredArticle && (

          <section className="featured-section">


            {/* SECTION TITLE */}

            <div className="section-title-row">

              <div>

                <span className="section-label">
                  TOP STORY
                </span>

                <h2>
                  Featured News
                </h2>

              </div>

            </div>



            {/* FEATURED CARD */}

            <div className="featured-card">


              {/* IMAGE */}

              <Link
                to={`/article/${featuredArticle.id}`}
                className="featured-image"
              >

                <img
                  src={getArticleImage(
                    featuredArticle
                  )}
                  alt={
                    featuredArticle.title ||
                    "Featured article"
                  }
                />


                {/* CATEGORY */}

                {getCategoryName(
                  featuredArticle
                ) && (

                  <span className="featured-badge">

                    {getCategoryName(
                      featuredArticle
                    )}

                  </span>

                )}

              </Link>



              {/* CONTENT */}

              <div className="featured-content">


                {/* META */}

                <div className="article-meta">

                  <span>

                    {featuredArticle.author ||
                      "Article Team"}

                  </span>


                  {featuredArticle.published_date && (

                    <>

                      <span>
                        •
                      </span>

                      <span>

                        {formatDate(
                          featuredArticle.published_date
                        )}

                      </span>

                    </>

                  )}

                </div>



                {/* TITLE */}

                <h2>

                  {featuredArticle.title}

                </h2>



                {/* DESCRIPTION */}

                <p>

                  {featuredArticle.short_description}

                </p>



                {/* READ BUTTON */}

                <Link
                  to={`/article/${featuredArticle.id}`}
                  className="primary-read"
                >

                  Read Full Article

                  <span>
                    →
                  </span>

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


            {/* TITLE */}

            <div className="section-title-row">

              <div>

                <span className="section-label">
                  JUST IN
                </span>

                <h2>
                  Latest News
                </h2>

              </div>


              {/* CONTROLS */}

              {carouselArticles.length > 1 && (

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

              )}

            </div>



            {/* CAROUSEL */}

            <div className="latest-carousel">

              {carouselArticles.map(
                (article, index) => {

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
                        transform:
                          `translateX(calc(${position} * (100% + 24px)))`,
                      }}
                    >


                      {/* IMAGE */}

                      <Link
                        to={`/article/${article.id}`}
                        className="latest-image"
                      >

                        <img
                          src={getArticleImage(
                            article
                          )}
                          alt={
                            article.title ||
                            "Article"
                          }
                        />


                        {/* CATEGORY */}

                        {getCategoryName(
                          article
                        ) && (

                          <span>

                            {getCategoryName(
                              article
                            )}

                          </span>

                        )}

                      </Link>



                      {/* CONTENT */}

                      <div className="latest-content">


                        {/* META */}

                        <div className="article-meta">

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



                        {/* TITLE */}

                        <h3>

                          <Link
                            to={`/article/${article.id}`}
                          >

                            {article.title}

                          </Link>

                        </h3>



                        {/* DESCRIPTION */}

                        <p>

                          {article.short_description}

                        </p>



                        {/* READ */}

                        <Link
                          to={`/article/${article.id}`}
                          className="small-read"
                        >

                          Read Story →

                        </Link>


                      </div>

                    </article>

                  );

                }
              )}

            </div>



            {/* DOTS */}

            {carouselArticles.length > 1 && (

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
                      aria-label={
                        `Go to slide ${index + 1}`
                      }
                    />

                  )
                )}

              </div>

            )}

          </section>

        )}



        {/* ======================================
            MORE NEWS
        ====================================== */}

        {latestArticles.length > 0 && (

          <section className="all-news-section">


            {/* TITLE */}

            <div className="section-title-row">

              <div>

                <span className="section-label">
                  DISCOVER
                </span>

                <h2>
                  More News
                </h2>

              </div>

            </div>



            {/* NEWS GRID */}

            <div className="news-grid">

              {latestArticles
                .slice(0, 9)
                .map((article) => (

                  <article
                    className="news-card"
                    key={article.id}
                  >


                    {/* IMAGE */}

                    <Link
                      to={`/article/${article.id}`}
                      className="news-card-image"
                    >

                      <img
                        src={getArticleImage(
                          article
                        )}
                        alt={
                          article.title ||
                          "Article"
                        }
                      />


                      {/* CATEGORY */}

                      {getCategoryName(
                        article
                      ) && (

                        <span>

                          {getCategoryName(
                            article
                          )}

                        </span>

                      )}

                    </Link>



                    {/* CONTENT */}

                    <div className="news-card-content">


                      {/* META */}

                      <div className="article-meta">

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



                      {/* TITLE */}

                      <h3>

                        <Link
                          to={`/article/${article.id}`}
                        >

                          {article.title}

                        </Link>

                      </h3>



                      {/* DESCRIPTION */}

                      <p>

                        {article.short_description}

                      </p>



                      {/* READ */}

                      <Link
                        to={`/article/${article.id}`}
                        className="small-read"
                      >

                        Read Article →

                      </Link>


                    </div>

                  </article>

                ))}

            </div>

          </section>

        )}



        {/* ======================================
            EMPTY
        ====================================== */}

        {!articles.length && (

          <div className="empty-box">

            <div>
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

      </main>



      {/* ======================================
          FOOTER
      ====================================== */}

      <footer className="home-footer">

        <div className="footer-inner">


          {/* LOGO */}

          <div>

            <div className="footer-logo">

              <span>
                A
              </span>

              ARTICLE

            </div>


            <p>
              Your source for stories, ideas
              and information.
            </p>

          </div>



          {/* LINKS */}

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



        {/* COPYRIGHT */}

        <div className="footer-bottom">

          © {new Date().getFullYear()}
          {" "}
          Article.
          {" "}
          All rights reserved.

        </div>

      </footer>

    </>
  );

}


export default Home;