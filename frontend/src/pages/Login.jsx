import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi, extractData } from "../api";
import { setAuth } from "../utils/auth";
import bgImg from "../assets/bg-image.png";
import "../styles/pages/login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fixed bubble positions and sizes to match screenshot
  const bubbles = useMemo(() => [
    { top: '-7%', left: '-3%', size: 200 },
    { top: '9%', left: '37%', size: 60 },
    { top: '77%', left: '48%', size: 120 },
    { top: '90%', left: '95%', size: 180 },
    { top: '10%', left: '90%', size: 90 }
  ].map((b, i) => (
    <div
      key={i}
      className="login-bubble"
      style={{
        width: b.size,
        height: b.size,
        top: b.top,
        left: b.left,
        position: 'fixed',
        opacity: .70,
        zIndex: 0
      }}
    />
  )), []);

  const targetPath = location.state?.from?.pathname || "/";

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      const data = extractData(response);
      if (!data?.user) {
        setError("Login failed. User payload is missing.");
        return;
      }
      setAuth(
        { ...data.user, employee_profile: data.employee_profile || null },
        data.token,
      );
      navigate(targetPath, { replace: true });
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative login-root">
      <div
        className="row w-100 justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="col-12 col-md-6 col-lg-5 d-flex justify-content-center align-items-center mb-4 mb-md-0">
          <img
            src={bgImg}
            alt="Background Decorative"
            className="login-bg-image img-fluid"
            style={{
              maxWidth: "1200px",
              width: "100%",
              height: "1350px",
              objectFit: "contain",
              background: "none",
              boxShadow: "none",
              borderRadius: 0,
            }}
            draggable={false}
            aria-hidden="true"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-5 d-flex align-items-center justify-content-center">
          <div className="position-relative w-100" style={{ maxWidth: 420 }}>
            <div className="login-bubbles">{bubbles}</div>
            <div className="login-content">
              <form
                className="login-form"
                onSubmit={handleLogin}
                autoComplete="off"
              >
                <h2>
                  Hello, <span style={{ color: "#4f8cff" }}>Admin.</span>
                  <br />
                  Welcome Back!
                </h2>
                <div className="welcome">Sign in to continue.</div>
                {error && (
                  <div className="alert alert-danger py-2">{error}</div>
                )}
                <div className="form-group">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Username"
                    autoFocus
                    required
                  />
                </div>
                <div className="form-group" style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      position: "absolute",
                      top: "50%",
                      right: 12,
                      transform: "translateY(-50%)",
                      display: "flex",
                      alignItems: "center",
                      height: 32,
                      width: 32,
                      justifyContent: "center",
                    }}
                    tabIndex={0}
                  >
                    <span
                      style={{
                        fontSize: "1.3em",
                        color: "#4f8cff",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showPassword ? (
                        <svg
                          width="22"
                          height="22"
                          fill="none"
                          stroke="#4f8cff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5 0-9.27-3.11-11-7.5a12.32 12.32 0 0 1 2.1-3.36M6.1 6.1A9.94 9.94 0 0 1 12 4c5 0 9.27 3.11 11 7.5a12.32 12.32 0 0 1-2.1 3.36M1 1l22 22" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg
                          width="22"
                          height="22"
                          fill="none"
                          stroke="#4f8cff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </span>
                  </button>
                </div>
                <button
                  type="submit"
                  className="sign-in-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        animation: "spin 0.8s linear infinite",
                        display: "block",
                        margin: "0 auto",
                      }}
                    >
                      <circle
                        cx="11"
                        cy="11"
                        r="9"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="3"
                      />
                      <path
                        d="M11 2a9 9 0 0 1 9 9"
                        stroke="#ffffff"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
