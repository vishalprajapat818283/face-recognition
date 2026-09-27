import { useEffect, useState } from "react";

import {
  getPeople,
  updatePerson,
  deletePerson
} from "../api";


function People() {

  const [people, setPeople] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [editingName, setEditingName] =
    useState("");


  const loadPeople = async () => {

    try {

      setLoading(true);

      const result =
        await getPeople();

      setPeople(result.people);

      setError("");

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Could not load registered people."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadPeople();

  }, []);


  const startEditing = (
    person
  ) => {

    setEditingId(person.id);

    setEditingName(person.name);
  };


  const saveName = async (
    id
  ) => {

    if (!editingName.trim()) {

      alert(
        "Name cannot be empty."
      );

      return;
    }

    try {

      await updatePerson(
        id,
        editingName.trim()
      );

      setEditingId(null);

      setEditingName("");

      await loadPeople();

    } catch (err) {

      alert(
        err.response?.data?.detail ||
        "Could not update person."
      );

    }
  };


  const removePerson = async (
    id,
    name
  ) => {

    const confirmed =
      window.confirm(
        `Delete ${name}?`
      );

    if (!confirmed) {
      return;
    }

    try {

      await deletePerson(id);

      await loadPeople();

    } catch (err) {

      alert(
        err.response?.data?.detail ||
        "Could not delete person."
      );

    }
  };


  return (

    <div className="page">

      <div className="people-header">

        <div>

          <h1>
            Registered People
          </h1>

          <p className="description">
            Manage people registered
            in the face recognition system.
          </p>

        </div>


        <div className="people-count">

          <span>
            {people.length}
          </span>

          <small>
            Registered
          </small>

        </div>

      </div>


      {loading && (
        <p>
          Loading registered people...
        </p>
      )}


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {!loading &&
        people.length === 0 && (

          <div className="empty-state">

            <h2>
              No registered people
            </h2>

            <p>
              Register someone using
              the webcam first.
            </p>

          </div>

        )}


      <div className="people-grid">

        {people.map((person, index) => (

          <div
            className="person-card"
            key={person.id}
          >

            <div className="person-number">
              #{index + 1}
            </div>


            {editingId === person.id ? (

              <div className="edit-area">

                <input
                  type="text"
                  value={editingName}
                  onChange={(event) =>
                    setEditingName(
                      event.target.value
                    )
                  }
                />

                <div className="edit-buttons">

                  <button
                    className="primary-button"
                    onClick={() =>
                      saveName(person.id)
                    }
                  >
                    Save
                  </button>

                  <button
                    className="secondary-button"
                    onClick={() => {
                      setEditingId(null);
                      setEditingName("");
                    }}
                  >
                    Cancel
                  </button>

                </div>

              </div>

            ) : (

              <>

                <h2>
                  {person.name}
                </h2>

                <div className="person-actions">

                  <button
                    className="secondary-button"
                    onClick={() =>
                      startEditing(person)
                    }
                  >
                    Edit Name
                  </button>

                  <button
                    className="delete-button"
                    onClick={() =>
                      removePerson(
                        person.id,
                        person.name
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </>

            )}

          </div>

        ))}

      </div>

    </div>

  );
}


export default People;