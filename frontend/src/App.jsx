import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Category from "./pages/Category";
import Subcategory from "./pages/Subcategory";
import ArticleDetails from "./pages/ArticleDetails";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AddArticle from "./pages/AddArticle";
import AuthorDashboard from "./pages/AuthorDashboard";
import ReviewerDashboard from "./pages/ReviewerDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ================= PUBLIC PAGES ================= */}

        <Route path="/" element={<Home />} />

        <Route path="/category/:id" element={<Category />} />

        <Route
          path="/subcategory/:id"
          element={<Subcategory />}
        />

        <Route
          path="/article/:id"
          element={<ArticleDetails />}
        />


        {/* ================= AUTH ================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ================= AUTHOR ================= */}

        <Route
          path="/author/dashboard"
          element={
            <ProtectedRoute role="author">
              <AuthorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add"
          element={
            <ProtectedRoute role="author">
              <AddArticle />
            </ProtectedRoute>
          }
        />


        {/* ================= REVIEWER ================= */}

        <Route
          path="/reviewer/dashboard"
          element={
            <ProtectedRoute role="reviewer">
              <ReviewerDashboard />
            </ProtectedRoute>
          }
        />


        {/* ================= UNKNOWN URL ================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;