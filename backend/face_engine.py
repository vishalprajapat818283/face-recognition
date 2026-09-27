import cv2
import insightface
import numpy as np


MATCH_THRESHOLD = 0.45


print("Loading InsightFace model...")

app = insightface.app.FaceAnalysis(
    name="buffalo_l",
    providers=["CPUExecutionProvider"]
)

app.prepare(
    ctx_id=0,
    det_size=(640, 640)
)

print("InsightFace model loaded successfully.")


def normalize_embedding(embedding):
    embedding = np.asarray(embedding, dtype=np.float32)

    norm = np.linalg.norm(embedding)

    if norm == 0:
        raise ValueError("Invalid face embedding.")

    return embedding / norm


def get_embedding_from_image(image_bytes):
    image_array = np.frombuffer(image_bytes, np.uint8)

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )

    if image is None:
        raise ValueError("Could not read uploaded image.")

    faces = app.get(image)

    return image, faces


def compare_embeddings(query_embedding, registered_embedding):
    query_embedding = normalize_embedding(query_embedding)
    registered_embedding = normalize_embedding(registered_embedding)

    similarity = float(
        np.dot(
            query_embedding,
            registered_embedding
        )
    )

    distance = 1.0 - similarity

    return similarity, distance


def recognize_faces(image_bytes, registered_people):
    image, faces = get_embedding_from_image(image_bytes)

    results = []

    for face_index, face in enumerate(faces):

        query_embedding = normalize_embedding(
            face.embedding
        )

        best_person = None
        best_distance = float("inf")
        best_similarity = -1.0

        for person in registered_people:

            registered_embedding = np.asarray(
                person["embedding"],
                dtype=np.float32
            )

            similarity, distance = compare_embeddings(
                query_embedding,
                registered_embedding
            )

            if distance < best_distance:
                best_distance = distance
                best_similarity = similarity
                best_person = person

        matched = (
            best_person is not None
            and best_distance <= MATCH_THRESHOLD
        )

        match_percentage = max(
            0.0,
            min(
                100.0,
                best_similarity * 100.0
            )
        )

        box = face.bbox.astype(int)

        results.append({
            "face_number": face_index + 1,
            "matched": matched,
            "name": (
                best_person["name"]
                if matched
                else "Unknown"
            ),
            "similarity": round(
                best_similarity,
                4
            ),
            "distance": round(
                best_distance,
                4
            ),
            "match_percentage": round(
                match_percentage,
                2
            ),
            "bounding_box": {
                "x1": int(box[0]),
                "y1": int(box[1]),
                "x2": int(box[2]),
                "y2": int(box[3])
            }
        })

    return results