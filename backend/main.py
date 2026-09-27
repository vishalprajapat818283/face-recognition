from fastapi import (
    FastAPI,
    File,
    Form,
    UploadFile,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from typing import List

from database import (
    test_database_connection,
    register_person,
    get_all_people,
    update_person_name,
    delete_person
)

from face_engine import (
    get_embedding_from_image,
    normalize_embedding,
    recognize_faces
)
app = FastAPI(
    title="Face Recognition API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.on_event("startup")
def startup_event():
    test_database_connection()


@app.get("/")
def root():
    return {
        "success": True,
        "message": "Face Recognition API is running."
    }


@app.get("/api/health")
def health():
    return {
        "success": True,
        "message": "API is healthy."
    }


@app.get("/api/people")
def people():
    people = get_all_people()

    result = []

    for person in people:
        result.append({
            "id": str(person["_id"]),
            "name": person["name"]
        })

    return {
        "success": True,
        "people": result
    }
@app.patch("/api/people/{person_id}")
async def update_person(
    person_id: str,
    name: str = Form(...)
):

    name = name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty."
        )

    try:

        updated = update_person_name(
            person_id,
            name
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid person ID."
        )

    if not updated:

        raise HTTPException(
            status_code=404,
            detail="Person not found."
        )

    return {
        "success": True,
        "message": "Person updated successfully.",
        "person": {
            "id": person_id,
            "name": name
        }
    }


@app.delete("/api/people/{person_id}")
async def delete_person_api(
    person_id: str
):

    try:

        deleted = delete_person(
            person_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid person ID."
        )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Person not found."
        )

    return {
        "success": True,
        "message": "Person deleted successfully."
    }

@app.post("/api/register")
async def register(
    name: str = Form(...),
    files: List[UploadFile] = File(...)
):

    if not name.strip():
        raise HTTPException(
            status_code=400,
            detail="Name is required."
        )

    if len(files) < 5:
        raise HTTPException(
            status_code=400,
            detail="At least 5 face samples are required."
        )

    embeddings = []

    for index, file in enumerate(files):

        image_bytes = await file.read()

        try:

            image, faces = get_embedding_from_image(
                image_bytes
            )

        except Exception as error:

            raise HTTPException(
                status_code=400,
                detail=f"Error processing sample {index + 1}: {error}"
            )

        if len(faces) == 0:

            raise HTTPException(
                status_code=400,
                detail=f"No face detected in sample {index + 1}."
            )

        if len(faces) > 1:

            raise HTTPException(
                status_code=400,
                detail=f"Multiple faces detected in sample {index + 1}."
            )

        embedding = normalize_embedding(
            faces[0].embedding
        )

        embeddings.append(embedding)

    # Convert embeddings to NumPy array
    import numpy as np

    embeddings_array = np.array(
        embeddings,
        dtype=np.float32
    )

    # Average all face embeddings
    average_embedding = np.mean(
        embeddings_array,
        axis=0
    )

    # Normalize final embedding
    average_embedding = normalize_embedding(
        average_embedding
    )

    person_id = register_person(
        name.strip(),
        average_embedding
    )

    return {
        "success": True,
        "message": "Person registered successfully.",
        "samples_used": len(embeddings),
        "person": {
            "id": person_id,
            "name": name.strip()
        }
    }


@app.post("/api/recognize")
async def recognize(
    file: UploadFile = File(...)
):

    image_bytes = await file.read()

    try:

        registered_people = get_all_people()

        if len(registered_people) == 0:

            raise HTTPException(
                status_code=400,
                detail="No registered people found."
            )

        results = recognize_faces(
            image_bytes,
            registered_people
        )

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    return {
        "success": True,
        "faces_detected": len(results),
        "results": results
    }