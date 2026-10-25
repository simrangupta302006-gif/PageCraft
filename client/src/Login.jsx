
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "register" : "login";

      const response = await fetch(
        `http://localhost:5000/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isRegister
              ? { name: name.trim(), email: email.trim(), password }
              : { email: email.trim(), password }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || "Something went wrong.");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else if (isRegister) {
        setIsRegister(false);
        setPassword("");
        setError("Account created. Please log in.");
      } else {
        setError("Login succeeded, but the server did not return a token.");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError("Unable to connect to the server. Check that your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          Page<span>Craft</span>
        </div>

        <div className="login-heading">
          <p className="login-label">
            {isRegister ? "GET STARTED" : "WELCOME BACK"}
          </p>
          <h1>{isRegister ? "Create your account" : "Login to PageCraft"}</h1>
          <p>
            {isRegister
              ? "Create an account and start building your professional portfolio."
              : "Continue building your professional portfolio."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="login-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                minLength={2}
                required
              />
            </div>
          )}

          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={isRegister ? 6 : undefined}
              required
            />
          </div>

          {error && (
            <p role="alert" className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create Account →"
                : "Log In →"}
          </button>
        </form>

        <p className="login-switch">
          {isRegister ? "Already have an account?" : "New to PageCraft?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setPassword("");
            }}
          >
            {isRegister ? "Log in" : "Create an account"}
          </button>
        </p>

        <p className="login-footer">
          Build your portfolio. Share your story.
        </p>
      </div>
    </div>
  );
}

export default Login;
