import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../services/api";
import "./Navbar.css";

function Navbar() {
  const [categories, setCategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();

      setCategories(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error("Category loading error:", error);
    }
  };

  const toggleCategory = (id) => {
    setOpenCategory(
      openCategory === id ? null : id
    );
  };

  return (
    <>
      {/* ================================
          TOP HEADER
      ================================= */}

      <header className="navbar" style={{position:"fixed" }}>

        <div className="navbar-inner">

          {/* LOGO */}

          <Link
            to="/"
            className="navbar-logo"
          >

            <div className="logo-icon">
              A
            </div>

            <div className="logo-text">

              <div className="logo-title">
                ARTICLE
              </div>

              <div className="logo-subtitle">
                NEWS & STORIES
              </div>

            </div>

          </Link>


          {/* RIGHT */}

          <div className="navbar-right">

            <button className="search-btn">
              ⌕ &nbsp; Search
            </button>

            <button className="login-btn">
              Login
            </button>

          </div>

        </div>

      </header>


      {/* ================================
          STICKY SIDEBAR
      ================================= */}

      <aside className="article-sidebar">

        {/* SIDEBAR TITLE */}

        <div className="sidebar-title">
          <span>ARTICLE</span>
          <h2>Menu</h2>
        </div>


        {/* HOME */}

        <Link
          to="/"
          className="sidebar-home"
        >
          <span className="menu-icon">⌂</span>
          <span>Home</span>
        </Link>


        {/* =============================
            CATEGORIES
        ============================== */}

        <div className="sidebar-categories">

          {categories.map((category) => (

            <div
              className="sidebar-category"
              key={category.id}
            >

              {/* CATEGORY ROW */}

              <div className="sidebar-category-row">

                <Link
                  to={`/category/${category.id}`}
                  className="sidebar-category-name"
                >
                  {category.name}
                </Link>


                {/* THREE DOT */}

                {category.subcategories &&
                  category.subcategories.length > 0 && (

                    <button
                      className={`three-dots ${
                        openCategory === category.id
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleCategory(category.id)
                      }
                    >
                      ⋮
                    </button>

                  )}

              </div>


              {/* =========================
                  SUBCATEGORIES
              ========================== */}

              {openCategory === category.id &&
                category.subcategories &&
                category.subcategories.length > 0 && (

                  <div className="sidebar-subcategories">

                    {category.subcategories.map(
                      (subcategory) => (

                        <Link
                          key={subcategory.id}
                          to={`/subcategory/${subcategory.id}`}
                          className="sidebar-subcategory"
                        >

                          <span className="sub-arrow">
                            →
                          </span>

                          {subcategory.name}

                        </Link>

                      )
                    )}

                  </div>

                )}

            </div>

          ))}

        </div>

      </aside>
    </>
  );
}

export default Navbar;