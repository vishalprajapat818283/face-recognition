import { useState } from "react";
import { recognizeImage } from "../api";
import ResultCard from "../components/ResultCard";

function Recognize() {

  const [file, setFile] = useState(null);

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setResults([]);

    if (!file) {
      setError("Please select an image.");
      return;
    }

    try {

      setLoading(true);

      const result = await recognizeImage(file);

      setResults(result.results);

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Recognition failed."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="page">

      <div className="card">

        <h1>
          Recognize Face
        </h1>

        <p className="description">
          Upload an image to identify
          registered people.
        </p>

        <form onSubmit={handleSubmit}>

          <label>
            Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(event) => {

              setFile(
                event.target.files[0]
              );

              setResults([]);
              setError("");

            }}
          />

          {file && (
            <p className="selected-file">
              Selected: {file.name}
            </p>
          )}

          <button
            type="submit"
            className="primary-button full-width"
            disabled={loading}
          >
            {loading
              ? "Recognizing..."
              : "Recognize Face"}
          </button>

        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

      </div>

      {results.length > 0 && (

        <div className="results-section">

          <h2>
            Recognition Results
          </h2>

          <div className="results-grid">

            {results.map((result) => (

              <ResultCard
                key={result.face_number}
                result={result}
              />

            ))}

          </div>

        </div>

      )}

    </div>
  );
}

export default Recognize;