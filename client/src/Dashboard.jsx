
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPortfolios = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/portfolios",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load portfolios.");
        }

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.portfolios)
            ? data.portfolios
            : [];

        setPortfolios(list.filter((item) => item && item._id));
      } catch (error) {
        console.error("Error fetching portfolios:", error);
        setError(error.message || "Unable to load portfolios.");
      } finally {
        setLoading(false);
      }
    };

    loadPortfolios();
  }, [navigate]);

  const handleCreatePortfolio = async (event) => {
    event.preventDefault();

    const title = portfolioTitle.trim();

    if (!title) {
      setError("Please enter a portfolio name.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/portfolios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create portfolio.");
      }

      const newPortfolio = data.portfolio || data;

      if (!newPortfolio || !newPortfolio._id) {
        throw new Error(
          "The server response did not contain a valid portfolio ID."
        );
      }

      setPortfolios((current) => [
        newPortfolio,
        ...current.filter((item) => item._id !== newPortfolio._id),
      ]);

      setPortfolioTitle("");
      setShowModal(false);
      navigate(`/editor/${newPortfolio._id}`);
    } catch (error) {
      console.error("Create portfolio error:", error);
      setError(error.message || "Unable to connect to server.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePortfolio = async (portfolio) => {
    const portfolioName = portfolio.title || "Untitled Portfolio";
    const confirmed = window.confirm(
      `Delete "${portfolioName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(portfolio._id);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/portfolios/${portfolio._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete portfolio.");
      }

      setPortfolios((current) =>
        current.filter((item) => item._id !== portfolio._id)
      );
    } catch (error) {
      console.error("Delete portfolio error:", error);
      setError(error.message || "Unable to connect to server.");
    } finally {
      setDeletingId("");
    }
  };

  if (loading) {
    return <div className="dashboard-page">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <nav className="dashboard-navbar">
        <div className="dashboard-logo">
          Page<span>Craft</span>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </button>
      </nav>

      <main className="dashboard-content">
        <section className="dashboard-header">
          <div>
            <p className="dashboard-label">DASHBOARD</p>
            <h1>Welcome to PageCraft 👋</h1>
            <p>
              Create, manage and customize your professional portfolios.
            </p>
          </div>

          <button
             className="create-portfolio-btn"
             onClick={() => navigate("/templates")}
          >
          + Create New Portfolio
        </button>
        </section>

        {error && (
          <p role="alert" className="dashboard-error">
            {error}
          </p>
        )}

        <section className="portfolio-section">
          <h2>Your Portfolios</h2>

          {portfolios.length === 0 ? (
            <div className="empty-state">
              <h3>No portfolios yet</h3>
              <p>Create your first portfolio to get started.</p>
            </div>
          ) : (
            <div className="portfolio-grid">
              {portfolios.map((portfolio) => (
                <div className="portfolio-card" key={portfolio._id}>
                  <div className="portfolio-card-preview">
                    <span>PageCraft</span>
                  </div>

                  <div className="portfolio-card-content">
                    <div>
                      <h3>{portfolio.title || "Untitled Portfolio"}</h3>
                      <p>{portfolio.published ? "Published" : "Draft"}</p>
                    </div>

                    <div className="portfolio-card-actions" style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="edit-portfolio-btn"
                        onClick={() => navigate(`/editor/${portfolio._id}`)}
                      >
                        Edit Portfolio
                      </button>
                      <button
                        type="button"
                        className="delete-portfolio-btn"
                        style={{ border: "1px solid #dc2626", color: "#b91c1c", background: "#fff", borderRadius: "8px", padding: "10px 14px", cursor: deletingId === portfolio._id ? "wait" : "pointer" }}
                        onClick={() => handleDeletePortfolio(portfolio)}
                        disabled={deletingId === portfolio._id}
                        aria-label={`Delete ${portfolio.title || "portfolio"}`}
                      >
                        {deletingId === portfolio._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!creating) setShowModal(false);
          }}
        >
          <div
            className="create-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowModal(false)}
              disabled={creating}
            >
              ×
            </button>

            <div className="modal-icon">✦</div>

            <h2>Create your portfolio</h2>

            <p className="modal-description">
              Give your portfolio a name. You can customize everything
              inside the editor later.
            </p>

            <form onSubmit={handleCreatePortfolio}>
              <label htmlFor="portfolio-title">Portfolio name</label>

              <input
                id="portfolio-title"
                type="text"
                placeholder="e.g. My Developer Portfolio"
                value={portfolioTitle}
                onChange={(event) => setPortfolioTitle(event.target.value)}
                autoFocus
                required
                maxLength={100}
                disabled={creating}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-create-btn"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create Portfolio →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
