function ResultCard({ result }) {

  return (
    <div
      className={
        result.matched
          ? "result-card matched"
          : "result-card unknown"
      }
    >

      <div className="result-face">
        Face {result.face_number}
      </div>

      <h2>
        {result.name}
      </h2>

      {result.matched ? (

        <>
          <div className="match-percentage">
            {result.match_percentage}%
          </div>

          <p>
            Match
          </p>
        </>

      ) : (

        <>
          <div className="unknown-text">
            UNKNOWN
          </div>

          <p>
            No registered person matched
            this face.
          </p>
        </>

      )}

      <div className="result-details">

        <div>
          Similarity:
          <strong>
            {" "}
            {result.similarity}
          </strong>
        </div>

        <div>
          Distance:
          <strong>
            {" "}
            {result.distance}
          </strong>
        </div>

      </div>

    </div>
  );
}

export default ResultCard;