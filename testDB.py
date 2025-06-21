from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# Replace with your MongoDB connection string
MONGODB_URI = "mongodb+srv://smartwrapperdb:w7pATE5xSGxuCNIL@smartwrapper.lpvdvlf.mongodb.net/tellmemoreDB"  # or your cloud connection string

def test_mongodb_connection(uri):
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)  # 5 second timeout
        # Trigger a server selection to test connection
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB.")
    except ConnectionFailure as e:
        print(f"❌ Could not connect to MongoDB: {e}")

if __name__ == "__main__":
    test_mongodb_connection(MONGODB_URI)
