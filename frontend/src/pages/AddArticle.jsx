import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getCategories,
  createArticle,
} from "../services/api";


function AddArticle() {

  const navigate = useNavigate();


  const [categories, setCategories] =
    useState([]);


  const [formData, setFormData] =
    useState({
      title: "",
      short_description: "",
      author: "",
      published_date: "",
      category_id: "",
    });


  const [image, setImage] =
    useState(null);


  const [preview, setPreview] =
    useState(null);


  const [loading, setLoading] =
    useState(false);


  // =====================================
  // GET CATEGORIES
  // =====================================

  useEffect(() => {

    const loadCategories =
      async () => {

        try {

          const response =
            await getCategories();

          setCategories(
            response.data
          );

        } catch (error) {

          console.error(
            error
          );

        }
      };


    loadCategories();

  }, []);


  // =====================================
  // INPUT CHANGE
  // =====================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setFormData({
      ...formData,
      [name]: value,
    });

  };


  // =====================================
  // IMAGE CHANGE
  // =====================================

  const handleImageChange = (e) => {

    const file =
      e.target.files[0];


    if (!file) return;


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      alert(
        "Only JPG, PNG and WEBP images are allowed"
      );

      return;
    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {

      alert(
        "Image size must be less than 5MB"
      );

      return;
    }


    setImage(file);


    setPreview(
      URL.createObjectURL(file)
    );

  };


  // =====================================
  // SUBMIT
  // =====================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();


      if (
        !formData.category_id
      ) {

        alert(
          "Please select a category"
        );

        return;
      }


      setLoading(true);


      try {

        const data =
          new FormData();


        data.append(
          "title",
          formData.title
        );


        data.append(
          "short_description",
          formData.short_description
        );


        data.append(
          "author",
          formData.author
        );


        if (
          formData.published_date
        ) {

          data.append(
            "published_date",
            formData.published_date
          );

        }


        data.append(
          "category_id",
          formData.category_id
        );


        if (image) {

          data.append(
            "image",
            image
          );

        }


        await createArticle(
          data
        );


        alert(
          "Article created successfully!"
        );


        navigate("/");


      } catch (error) {

        console.error(
          "Create article error:",
          error
        );


        alert(
          error.response?.data?.detail ||
          "Failed to create article"
        );

      } finally {

        setLoading(false);

      }

    };


  return (

    <div className="form-page">

      <div className="form-container">


        <div className="form-header">

          <button
            type="button"
            className="back-btn"
            onClick={() =>
              navigate("/")
            }
          >
            ← Back
          </button>


          <h1>
            Add New Article
          </h1>


          <p>
            Create and publish a
            new article.
          </p>

        </div>


        <form
          className="article-form"
          onSubmit={handleSubmit}
        >


          {/* TITLE */}

          <div className="form-group">

            <label>
              Title
            </label>


            <input
              type="text"
              name="title"
              placeholder="Enter article title"
              value={
                formData.title
              }
              onChange={
                handleChange
              }
              required
            />

          </div>


          {/* DESCRIPTION */}

          <div className="form-group">

            <label>
              Short Description
            </label>


            <textarea
              name="short_description"
              placeholder="Enter short description"
              value={
                formData.short_description
              }
              onChange={
                handleChange
              }
              rows="5"
              required
            />

          </div>


          {/* IMAGE */}

          <div className="form-group">

            <label>
              Article Image
            </label>


            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleImageChange
              }
            />


            {preview && (

              <div className="image-preview">

                <img
                  src={preview}
                  alt="Preview"
                />

              </div>

            )}

          </div>


          {/* AUTHOR */}

          <div className="form-group">

            <label>
              Author
            </label>


            <input
              type="text"
              name="author"
              placeholder="Enter author name"
              value={
                formData.author
              }
              onChange={
                handleChange
              }
              required
            />

          </div>


          {/* DATE */}

          <div className="form-group">

            <label>
              Published Date
            </label>


            <input
              type="datetime-local"
              name="published_date"
              value={
                formData.published_date
              }
              onChange={
                handleChange
              }
            />

          </div>


          {/* CATEGORY */}

          <div className="form-group">

            <label>
              Category
            </label>


            <select
              name="category_id"
              value={
                formData.category_id
              }
              onChange={
                handleChange
              }
              required
            >

              <option value="">
                Select Category
              </option>


              {categories.map(
                (category) => (

                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {
                      category.name
                    }
                  </option>

                )
              )}

            </select>

          </div>


          {/* BUTTONS */}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                navigate("/")
              }
            >
              Cancel
            </button>


            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >

              {loading
                ? "Uploading..."
                : "Create Article"}

            </button>

          </div>


        </form>

      </div>

    </div>
  );
}


export default AddArticle;