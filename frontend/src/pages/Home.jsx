import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page home-page">

      <div className="hero">

        <h1>
          Face Recognition System
        </h1>

        <p>
          Register people and recognize faces
          using AI-powered face embeddings.
        </p>

        <div className="home-buttons">

          <Link
            to="/register"
            className="primary-button"
          >
            Register Face
          </Link>

          <Link
            to="/recognize"
            className="secondary-button"
          >
            Recognize Face
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Home;