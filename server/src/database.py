from pymongo import MongoClient
from src.config import MONGODB_URI

COLLECTION_NAME: str = "template_db"


class _Database:
    def __init__(self) -> None:
        self.client = MongoClient(MONGODB_URI)

        if COLLECTION_NAME not in self.client.list_database_names():
            self.db = self.client[COLLECTION_NAME]
        self.db = self.client[COLLECTION_NAME]


Database = _Database()
