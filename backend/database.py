import os

from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId


load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DATABASE = os.getenv(
    "MONGODB_DATABASE",
    "face_recognition"
)
MONGODB_COLLECTION = os.getenv(
    "MONGODB_COLLECTION",
    "faces"
)


if not MONGODB_URI:
    raise RuntimeError(
        "MONGODB_URI is not set in .env"
    )


client = MongoClient(MONGODB_URI)

database = client[MONGODB_DATABASE]

faces_collection = database[
    MONGODB_COLLECTION
]


def test_database_connection():
    client.admin.command("ping")
    print("MongoDB connection successful.")


def register_person(name, embedding):

    document = {
        "name": name,
        "embedding": embedding.tolist()
    }

    result = faces_collection.insert_one(
        document
    )

    return str(result.inserted_id)


def get_all_people():

    return list(
        faces_collection.find(
            {},
            {
                "_id": 1,
                "name": 1,
                "embedding": 1
            }
        )
    )


def update_person_name(person_id, new_name):

    result = faces_collection.update_one(
        {
            "_id": ObjectId(person_id)
        },
        {
            "$set": {
                "name": new_name
            }
        }
    )

    return result.modified_count > 0


def delete_person(person_id):

    result = faces_collection.delete_one(
        {
            "_id": ObjectId(person_id)
        }
    )

    return result.deleted_count > 0