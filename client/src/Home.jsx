import { Link } from "react-router-dom";
function Home() {
  
  return (
    
    <div className="app">
  
      <nav className="navbar">
        <div className="logo">
          Page<span>Craft</span>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <Link to="/login" className="login-btn">
             Log in
          </Link>
          <Link to="/login" className="signup-btn">
            Get Started
          </Link>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="badge">
              ✦ Build your portfolio. No code required.
            </div>

            <h1>
              Create a portfolio
              <br />
              <span>you’re proud of.</span>
            </h1>

            <p>
              PageCraft lets you build a professional portfolio and
              resume using simple drag-and-drop blocks. No coding.
              No complicated design tools.
            </p>

            <div className="hero-buttons">
                <Link to="/login" className="primary-btn">
                  Create My Portfolio →
                </Link>

              <Link to="/templates" className="secondary-btn">
                Explore Templates
              </Link>
            </div>

            <p className="hero-note">
              Free to start • Easy to customize • Export as PDF
            </p>
          </div>

          <div className="hero-preview">
            <div className="preview-window">

              <div className="preview-topbar">
                <div className="window-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="preview-title">
                  My Portfolio
                </div>
              </div>

              <div className="preview-body">

                <div className="preview-sidebar">
                  <div className="sidebar-title">
                    Blocks
                  </div>

                  <div className="block-item">＋ Header</div>
                  <div className="block-item">＋ About</div>
                  <div className="block-item">＋ Skills</div>
                  <div className="block-item">＋ Projects</div>
                  <div className="block-item">＋ Experience</div>
                  <div className="block-item">＋ Contact</div>
                </div>

                <div className="portfolio-preview">
                  <div className="portfolio-hero">
                    <div className="avatar"></div>

                    <h2>
                      Hi, I'm Alex 👋
                    </h2>

                    <p>
                      Full Stack Developer
                    </p>

                    <div className="mini-button">
                      View My Work
                    </div>
                  </div>

                  <div className="preview-section">
                    <div className="section-line"></div>
                    <div className="section-line short"></div>
                  </div>

                  <div className="project-cards">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section className="features" id="features">
          <div className="section-heading">
            <p>POWERFUL & SIMPLE</p>

            <h2>
              Everything you need to
              <br />
              build your portfolio.
            </h2>
          </div>

          <div className="feature-grid">

            <div className="feature-card">
              <div className="feature-icon">✦</div>
              <h3>Drag & Drop</h3>
              <p>
                Build your page by dragging ready-made sections
                exactly where you want them.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✎</div>
              <h3>Live Editing</h3>
              <p>
                Edit your content directly and instantly see
                how your portfolio looks.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">◈</div>
              <h3>Beautiful Templates</h3>
              <p>
                Choose a professional design and customize it
                without losing your content.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">↓</div>
              <h3>Export & Share</h3>
              <p>
                Publish your portfolio online or export it as
                a professional PDF.
              </p>
            </div>

          </div>
        </section>
      </main>

      <footer>
        <div className="logo">
          Page<span>Craft</span>
        </div>

        <p>
          Build something worth sharing.
        </p>
      </footer>

    </div>
  );
}

export default Home;