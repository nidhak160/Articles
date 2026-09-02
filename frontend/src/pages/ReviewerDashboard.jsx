import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ReviewerDashboard.css";

const API_URL = "http://127.0.0.1:8000";

function ReviewerDashboard() {
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const token = localStorage.getItem("token");

  // ==========================================
  // GET PENDING ARTICLES
  // ==========================================

  const fetchArticles = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/reviewer/articles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setArticles(response.data);
    } catch (error) {
      console.error("Fetch articles error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
      } else {
        setMessage(
          error.response?.data?.detail ||
            "Failed to load articles"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // ==========================================
  // VIEW ARTICLE
  // ==========================================

  const viewArticle = (article) => {
    console.log("VIEW ARTICLE:", article);

    setSelectedArticle(article);
  };

  // ==========================================
  // CLOSE ARTICLE
  // ==========================================

  const closeArticle = () => {
    setSelectedArticle(null);
  };

  // ==========================================
  // APPROVE
  // ==========================================

  const approveArticle = async (id) => {
    try {
      await axios.put(
        `${API_URL}/reviewer/articles/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Article approved successfully");

      setSelectedArticle(null);

      fetchArticles();
    } catch (error) {
      console.error("Approve error:", error);

      setMessage(
        error.response?.data?.detail ||
          "Failed to approve article"
      );
    }
  };

  // ==========================================
  // REJECT
  // ==========================================

  const rejectArticle = async (id) => {
    const reason = window.prompt(
      "Enter rejection reason:"
    );

    if (!reason) {
      return;
    }

    try {
      await axios.put(
        `${API_URL}/reviewer/articles/${id}/reject`,
        {
          reason: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Article rejected");

      setSelectedArticle(null);

      fetchArticles();
    } catch (error) {
      console.error("Reject error:", error);

      setMessage(
        error.response?.data?.detail ||
          "Failed to reject article"
      );
    }
  };

  // ==========================================
  // PUBLISH
  // ==========================================

  const publishArticle = async (id) => {
    try {
      await axios.put(
        `${API_URL}/reviewer/articles/${id}/publish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Article published successfully");

      setSelectedArticle(null);

      fetchArticles();
    } catch (error) {
      console.error("Publish error:", error);

      setMessage(
        error.response?.data?.detail ||
          "Failed to publish article"
      );
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="reviewer-loading">
        Loading reviewer dashboard...
      </div>
    );
  }

  return (
    <div className="reviewer-dashboard">

      {/* ==========================================
          HEADER
      ========================================== */}

      <header className="reviewer-header">

        <div>
          <h1>Reviewer Dashboard</h1>

          <p>
            Review and manage submitted articles
          </p>
        </div>

        <button
          className="reviewer-logout"
          onClick={logout}
        >
          Logout
        </button>

      </header>


      {/* ==========================================
          MESSAGE
      ========================================== */}

      {message && (
        <div className="reviewer-message">
          {message}
        </div>
      )}


      {/* ==========================================
          STATS
      ========================================== */}

      <div className="reviewer-stats">

        <div className="reviewer-stat-card">

          <span>Total Pending</span>

          <strong>
            {articles.length}
          </strong>

        </div>


        <div className="reviewer-stat-card">

          <span>Review Status</span>

          <strong>
            Active
          </strong>

        </div>

      </div>


      {/* ==========================================
          ARTICLES
      ========================================== */}

      <section className="reviewer-section">

        <div className="reviewer-section-title">

          <div>

            <h2>
              Articles Awaiting Review
            </h2>

            <p>
              Check submitted articles before publishing.
            </p>

          </div>


          <button
            onClick={fetchArticles}
            className="refresh-btn"
          >
            Refresh
          </button>

        </div>


        {articles.length === 0 ? (

          <div className="no-articles">

            <h3>
              No articles to review
            </h3>

            <p>
              New author submissions will appear here.
            </p>

          </div>

        ) : (

          <div className="reviewer-table-wrapper">

            <table className="reviewer-table">

              <thead>

                <tr>

                  <th>
                    Image
                  </th>

                  <th>
                    Article
                  </th>

                  <th>
                    Author
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {articles.map((article) => (

                  <tr key={article.id}>

                    {/* IMAGE */}

                    <td>

                      {article.image ? (

                        <img
                          src={`${API_URL}${article.image}`}
                          alt={article.title}
                          className="reviewer-article-image"
                        />

                      ) : (

                        <div className="no-image">
                          No Image
                        </div>

                      )}

                    </td>


                    {/* ARTICLE */}

                    <td>

                      <div className="article-title-cell">

                        <strong>
                          {article.title}
                        </strong>

                        <span>
                          {article.short_description}
                        </span>

                      </div>

                    </td>


                    {/* AUTHOR */}

                    <td>
                      {article.author}
                    </td>


                    {/* CATEGORY */}

                    <td>
                      {article.category_id}
                    </td>


                    {/* STATUS */}

                    <td>

                      <span className="status-badge">
                        {article.status}
                      </span>

                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div className="reviewer-actions">

                        {/* VIEW */}

                        <button
                          type="button"
                          className="view-btn"
                          onClick={() =>
                            viewArticle(article)
                          }
                        >
                          View
                        </button>


                        {/* APPROVE */}

                        {article.status ===
                          "pending_review" && (
                          <>

                            <button
                              type="button"
                              className="approve-btn"
                              onClick={() =>
                                approveArticle(
                                  article.id
                                )
                              }
                            >
                              Approve
                            </button>


                            {/* REJECT */}

                            <button
                              type="button"
                              className="reject-btn"
                              onClick={() =>
                                rejectArticle(
                                  article.id
                                )
                              }
                            >
                              Reject
                            </button>

                          </>
                        )}


                        {/* PUBLISH */}

                        {article.status ===
                          "approved" && (

                          <button
                            type="button"
                            className="publish-btn"
                            onClick={() =>
                              publishArticle(
                                article.id
                              )
                            }
                          >
                            Publish
                          </button>

                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* ==========================================
          FULL ARTICLE VIEW
      ========================================== */}

      {selectedArticle && (

        <div
          className="article-modal-overlay"
          onClick={closeArticle}
        >

          <div
            className="article-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="article-modal-close"
              onClick={closeArticle}
            >
              ×
            </button>


            {/* IMAGE */}

            {selectedArticle.image ? (

              <img
                src={`${API_URL}${selectedArticle.image}`}
                alt={selectedArticle.title}
                className="full-article-image"
              />

            ) : (

              <div className="full-article-no-image">
                No Image Available
              </div>

            )}


            {/* CATEGORY */}

            <div className="full-article-category">
              CATEGORY #{selectedArticle.category_id}
            </div>


            {/* TITLE */}

            <h1 className="full-article-title">
              {selectedArticle.title}
            </h1>


            {/* META */}

            <div className="full-article-meta">

              <span>
                <strong>
                  Author:
                </strong>{" "}
                {selectedArticle.author}
              </span>


              <span>
                <strong>
                  Status:
                </strong>{" "}
                {selectedArticle.status}
              </span>


              <span>
                <strong>
                  Date:
                </strong>{" "}

                {selectedArticle.published_date
                  ? new Date(
                      selectedArticle.published_date
                    ).toLocaleDateString()
                  : "Not available"}

              </span>

            </div>


            {/* SHORT DESCRIPTION */}

            <div className="full-article-short-description">

              {selectedArticle.short_description}

            </div>


            {/* FULL CONTENT */}

            <div className="full-article-content-section">

              <h2>
                Article Content
              </h2>


              {selectedArticle.content ? (

                <div className="full-article-content">

                  {selectedArticle.content}

                </div>

              ) : (

                <div className="content-not-found">

                  Article content is not available.

                </div>

              )}

            </div>


            {/* ACTION BUTTONS */}

            <div className="full-article-actions">

              {selectedArticle.status ===
                "pending_review" && (
                <>

                  <button
                    type="button"
                    className="approve-btn"
                    onClick={() =>
                      approveArticle(
                        selectedArticle.id
                      )
                    }
                  >
                    Approve
                  </button>


                  <button
                    type="button"
                    className="reject-btn"
                    onClick={() =>
                      rejectArticle(
                        selectedArticle.id
                      )
                    }
                  >
                    Reject
                  </button>

                </>
              )}


              {selectedArticle.status ===
                "approved" && (

                <button
                  type="button"
                  className="publish-btn"
                  onClick={() =>
                    publishArticle(
                      selectedArticle.id
                    )
                  }
                >
                  Publish
                </button>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default ReviewerDashboard;