import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import "./Login.css";


function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");


    // ==========================================
    // LOGIN
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        if (!email.trim()) {

            setError("Please enter your email.");

            return;
        }


        if (!password) {

            setError("Please enter your password.");

            return;
        }


        try {

            setLoading(true);


            const response = await loginUser(
                email,
                password
            );


            console.log(
                "Login response:",
                response
            );


            // ======================================
            // SAVE LOGIN DATA
            // ======================================

            localStorage.setItem(
                "token",
                response.access_token
            );


            localStorage.setItem(
                "user",
                JSON.stringify(response.user)
            );


            // ======================================
            // ROLE BASED REDIRECT
            // ======================================

            const role = response.user.role;


            if (role === "author") {

                navigate("/author/dashboard");

            } else if (role === "reviewer") {

                navigate("/reviewer/dashboard");

            } else {

                navigate("/home");

            }


        } catch (err) {

            console.error(
                "Login error:",
                err
            );


            if (err.response) {

                const detail =
                    err.response.data?.detail;

                setError(
                    detail ||
                    "Invalid email or password."
                );

            } else {

                setError(
                    "Cannot connect to the server."
                );

            }

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="login-page">

            <div className="login-card">


                {/* ==================================
                    LEFT SIDE
                ================================== */}

                <div className="login-left">

                    <div className="login-logo">
                        NEWS<span>HUB</span>
                    </div>


                    <div className="login-intro">

                        <p className="login-small-title">
                            WELCOME BACK
                        </p>

                        <h1>
                            Stay informed.
                            <br />
                            Stay connected.
                        </h1>

                        <p>
                            Sign in to access the latest
                            news, articles and personalized
                            content.
                        </p>

                    </div>


                    <div className="login-bottom">

                        <span>
                            NEWSHUB
                        </span>

                        <span>
                            INFORMATION • INSIGHT • IMPACT
                        </span>

                    </div>

                </div>


                {/* ==================================
                    RIGHT SIDE
                ================================== */}

                <div className="login-right">

                    <div className="login-header">

                        <h2>
                            Welcome Back
                        </h2>

                        <p>
                            Sign in to your account
                        </p>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="login-error">
                            {error}
                        </div>

                    )}


                    <form onSubmit={handleSubmit}>


                        {/* EMAIL */}

                        <div className="login-field">

                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                disabled={loading}
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="login-field">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                                disabled={loading}
                            />

                        </div>


                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Signing in..."
                                : "Sign In"
                            }

                        </button>

                    </form>


                    {/* REGISTER */}

                    <div className="login-register">

                        <span>
                            Don't have an account?
                        </span>

                        <Link to="/register">
                            Create Account
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
}


export default Login;