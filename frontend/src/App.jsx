import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import AddArticle from "./pages/AddArticle";
import Category from "./pages/Category";
import Subcategory from "./pages/Subcategory";
import ArticleDetails from "./pages/ArticleDetails";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* Home */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* Category */}

        <Route
          path="/category/:id"
          element={<Category />}
        />


        {/* Subcategory */}

        <Route
          path="/subcategory/:id"
          element={<Subcategory />}
        />


        {/* Full Article */}

        <Route
          path="/article/:id"
          element={<ArticleDetails />}
        />


        {/* Add Article */}

        <Route
          path="/add"
          element={<AddArticle />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;