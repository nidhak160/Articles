import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories } from "../services/api";
import "./Navbar.css";

function Navbar() {
  const [categories, setCategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();

    // Check login status
    checkLoginStatus();

    // Listen for login/logout changes
    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  // ==============================
  // CHECK LOGIN STATUS
  // ==============================

  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");

    setIsLoggedIn(!!token);
  };

  // ==============================
  // LOAD CATEGORIES
  // ==============================

  const loadCategories = async () => {
    try {
      const data = await getCategories();

      console.log("Categories:", data);

      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Category loading error:", error);
    }
  };

  // ==============================
  // CATEGORY CLICK
  // ==============================

  const handleCategoryClick = (categoryId) => {
    setOpenCategory((current) =>
      current === categoryId ? null : categoryId
    );
  };

  // ==============================
  // LOGOUT
  // ==============================

  const handleLogout = () => {
    // Remove login information
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Update navbar immediately
    setIsLoggedIn(false);

    // Go to login page
    navigate("/login");
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}

      <header
        className="navbar"
        style={{ position: "fixed" }}
      >
        <div className="navbar-inner">

          {/* ================= LOGO ================= */}

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


          {/* ================= RIGHT SIDE ================= */}

          <div className="navbar-right">

            {/* SEARCH */}

            <button className="search-btn">

              <span className="search-icon">
                ⌕
              </span>

              Search

            </button>


            {/* ================= LOGIN / LOGOUT ================= */}

            {isLoggedIn ? (

              <button
                className="login-btn"
                onClick={handleLogout}
              >
                Logout
              </button>

            ) : (

              <Link
                to="/login"
                className="login-btn"
              >
                Login
              </Link>

            )}

          </div>

        </div>
      </header>


      {/* ================= SIDEBAR ================= */}

      <aside className="article-sidebar">

        <div className="sidebar-title">

          <span>
            ARTICLE
          </span>

          <h2>
            Menu
          </h2>

        </div>


        {/* ================= HOME ================= */}

        <Link
          to="/"
          className="sidebar-home"
        >

          <span className="menu-icon">
            ⌂
          </span>

          <span>
            Home
          </span>

        </Link>


        {/* ================= CATEGORIES ================= */}

        <div className="sidebar-categories">

          {categories.map((category) => {

            const hasSubcategories =
              Array.isArray(category.subcategories) &&
              category.subcategories.length > 0;

            const isOpen =
              openCategory === category.id;

            return (

              <div
                className="sidebar-category"
                key={category.id}
              >

                {/* CATEGORY */}

                <div
                  className={`sidebar-category-name ${
                    isOpen ? "category-open" : ""
                  }`}
                  onClick={() =>
                    handleCategoryClick(category.id)
                  }
                >

                  <span className="category-icon">
                    •
                  </span>

                  <span>
                    {category.name}
                  </span>

                </div>


                {/* ================= SUBCATEGORIES ================= */}

                {isOpen &&
                  hasSubcategories && (

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

                            <span>
                              {subcategory.name}
                            </span>

                          </Link>

                        )
                      )}

                    </div>

                  )}

              </div>

            );

          })}

        </div>

      </aside>
    </>
  );
}

export default Navbar;