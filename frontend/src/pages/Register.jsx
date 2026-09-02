import { useState } from "react";
import { registerUser } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";


function Register() {

    const navigate = useNavigate();


    // ==========================================
    // FORM DATA
    // ==========================================

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    });


    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // ==========================================
    // HANDLE INPUT
    // ==========================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };


    // ==========================================
    // REGISTER
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        // ======================================
        // VALIDATION
        // ======================================

        if (!formData.name.trim()) {

            setError(
                "Please enter your name."
            );

            return;
        }


        if (!formData.email.trim()) {

            setError(
                "Please enter your email."
            );

            return;
        }


        if (formData.password.length < 6) {

            setError(
                "Password must be at least 6 characters."
            );

            return;
        }


        // ======================================
        // API CALL
        // ======================================

        try {

            setLoading(true);


            const response = await registerUser(
                formData
            );


            console.log(
                "Registration successful:",
                response
            );


            // ==================================
            // SUCCESS MESSAGE
            // ==================================

            setSuccess(
                "Registration successful! Redirecting to login..."
            );


            // ==================================
            // CLEAR FORM
            // ==================================

            setFormData({
                name: "",
                email: "",
                password: "",
                role: "user",
            });


            // ==================================
            // GO TO LOGIN
            // ==================================

            setTimeout(() => {

                navigate("/login");

            }, 1500);


        } catch (err) {

            console.error(
                "Registration error:",
                err
            );


            // ==================================
            // FASTAPI ERROR
            // ==================================

            if (err.response) {

                const detail =
                    err.response.data?.detail;


                if (Array.isArray(detail)) {

                    setError(
                        detail
                            .map((item) => item.msg)
                            .join(", ")
                    );

                } else {

                    setError(
                        detail ||
                        "Registration failed."
                    );

                }

            } else {

                setError(
                    "Cannot connect to the server."
                );

            }

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="register-page">

            <div className="register-card">


                {/* ==================================
                    LEFT SIDE
                ================================== */}

                <div className="register-left">

                    <div className="register-logo">
                        NEWS<span>HUB</span>
                    </div>


                    <div className="register-intro">

                        <p className="register-small-title">
                            JOIN OUR COMMUNITY
                        </p>

                        <h1>
                            Create your
                            <br />
                            account.
                        </h1>

                        <p className="register-description">

                            Join NewsHub and discover the
                            latest stories, insights and
                            updates from around the world.

                        </p>

                    </div>


                    <div className="register-features">


                        {/* FEATURE 1 */}

                        <div className="feature-item">

                            <span className="feature-number">
                                01
                            </span>

                            <div>

                                <h3>
                                    Read
                                </h3>

                                <p>
                                    Explore the latest news
                                    and articles.
                                </p>

                            </div>

                        </div>


                        {/* FEATURE 2 */}

                        <div className="feature-item">

                            <span className="feature-number">
                                02
                            </span>

                            <div>

                                <h3>
                                    Create
                                </h3>

                                <p>
                                    Authors can write and
                                    submit articles.
                                </p>

                            </div>

                        </div>


                        {/* FEATURE 3 */}

                        <div className="feature-item">

                            <span className="feature-number">
                                03
                            </span>

                            <div>

                                <h3>
                                    Connect
                                </h3>

                                <p>
                                    Become part of our
                                    growing community.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    RIGHT SIDE
                ================================== */}

                <div className="register-right">


                    <div className="register-form-header">

                        <h2>
                            Create Account
                        </h2>

                        <p>
                            Enter your details below to get started.
                        </p>

                    </div>


                    {/* ==================================
                        ERROR
                    ================================== */}

                    {error && (

                        <div className="register-alert error">

                            {error}

                        </div>

                    )}


                    {/* ==================================
                        SUCCESS
                    ================================== */}

                    {success && (

                        <div className="register-alert success">

                            {success}

                        </div>

                    )}


                    <form onSubmit={handleSubmit}>


                        {/* ==================================
                            NAME
                        ================================== */}

                        <div className="register-field">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={loading}
                            />

                        </div>


                        {/* ==================================
                            EMAIL
                        ================================== */}

                        <div className="register-field">

                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                            />

                        </div>


                        {/* ==================================
                            PASSWORD
                        ================================== */}

                        <div className="register-field">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                placeholder="Minimum 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                            />

                        </div>


                        {/* ==================================
                            ROLE
                        ================================== */}

                        <div className="register-field">

                            <label>
                                Account Type
                            </label>

                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                disabled={loading}
                            >

                                <option value="user">
                                    Reader / User
                                </option>

                                <option value="author">
                                    Author
                                </option>

                                <option value="reviewer">
                                    Reviewer
                                </option>

                            </select>

                        </div>


                        {/* ==================================
                            BUTTON
                        ================================== */}

                        <button
                            type="submit"
                            className="register-btn"
                            disabled={loading}
                        >

                            {loading
                                ? "Creating Account..."
                                : "Create Account"
                            }

                        </button>

                    </form>


                    {/* ==================================
                        LOGIN
                    ================================== */}

                    <div className="register-login">

                        <span>
                            Already have an account?
                        </span>

                        <Link to="/login">
                            Login
                        </Link>

                    </div>

                </div>

            </div>

        </div>

    );
}


export default Register;