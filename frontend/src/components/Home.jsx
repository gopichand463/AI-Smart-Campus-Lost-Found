import { Link } from "react-router-dom";

function Home() {
  return (
    <main>
      <section className="hero">
        <h1>AI-Powered Smart Campus Lost & Found</h1>

        <p>
          Find what you lost. Help return what you found.
        </p>

        <div className="hero-buttons">
          <Link to="/report-lost" className="hero-button">
            Report Lost Item
          </Link>

          <Link to="/report-found" className="hero-button">
            Report Found Item
          </Link>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>

        <div className="steps">
          <div className="step-card">
            <h3>1. Report</h3>
            <p>
              Report a lost or found item with its details and image.
            </p>
          </div>

          <div className="step-card">
            <h3>2. AI Match</h3>
            <p>
              Our AI compares images and descriptions to find possible matches.
            </p>
          </div>

          <div className="step-card">
            <h3>3. Recover</h3>
            <p>
              Get notified about potential matches and recover your belongings.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;