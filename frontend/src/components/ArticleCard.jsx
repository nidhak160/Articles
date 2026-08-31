function ArticleCard({
  article,
  categoryName,
  onDelete,
}) {
  return (
    <div className="article-card">

      {/* IMAGE */}
      <div className="article-image">

        {article.image ? (
          <img
            src={`http://127.0.0.1:8000${article.image}`}
            alt={article.title}
          />
        ) : (
          <div className="no-image">
            No Image
          </div>
        )}

      </div>


      {/* CONTENT */}
      <div className="article-content">

        <span className="article-category">
          {categoryName}
        </span>


        <h2>
          {article.title}
        </h2>


        <p>
          {article.short_description}
        </p>


        <div className="article-meta">

          <span>
            By {article.author}
          </span>

          <span>
            {article.published_date
              ? new Date(
                  article.published_date
                ).toLocaleDateString()
              : ""}
          </span>

        </div>


        <button
          className="delete-btn"
          onClick={() =>
            onDelete(article.id)
          }
        >
          Delete
        </button>

      </div>

    </div>
  );
}

export default ArticleCard;