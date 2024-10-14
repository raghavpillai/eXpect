from pymongo import MongoClient
from src.config import MONGODB_URI

COLLECTION_NAME: str = "expect_db"


class _Database:
    def __init__(self) -> None:
        self.client = MongoClient(MONGODB_URI)
        self.db = self.client["x_cache"]

    def get_cached_data(self, collection_name: str, key: str):
        collection = self.db[collection_name]
        result = collection.find_one({"_id": key})
        return result["data"] if result else None

    def save_cached_data(self, collection_name: str, key: str, data: dict):
        collection = self.db[collection_name]
        collection.update_one({"_id": key}, {"$set": {"data": data}}, upsert=True)

    def log_user_usage(self, username: str):
        collection = self.db["user_usage"]
        collection.update_one({"_id": username}, {"$inc": {"usage": 1}}, upsert=True)


Database = _Database()
