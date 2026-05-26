import os
import logging
import uuid
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
logger = logging.getLogger(__name__)

# --- Mock Supabase Client implementation for offline/local testing ------------

class MockQuery:
    def __init__(self, table_name, client):
        self.table_name = table_name
        self.client = client
        self._filters = []
        self._order_by = None
        self._limit = None

    def insert(self, data):
        records = data if isinstance(data, list) else [data]
        inserted = []
        for r in records:
            if "id" not in r:
                r["id"] = str(uuid.uuid4())
            self.client.store[r["id"]] = r
            inserted.append(r)
        
        class ExecuteResult:
            def __init__(self, d):
                self.data = d
            def execute(self):
                return self
        
        return ExecuteResult(inserted if isinstance(data, list) else inserted[0])

    def select(self, columns="*"):
        return self

    def order(self, column, desc=False):
        self._order_by = (column, desc)
        return self

    def limit(self, count):
        self._limit = count
        return self

    def eq(self, column, value):
        self._filters.append((column, value))
        return self

    def single(self):
        class SingleResult:
            def __init__(self, query):
                self.query = query
            def execute(self):
                records = list(self.query.client.store.values())
                for col, val in self.query._filters:
                    records = [r for r in records if r.get(col) == val]
                data = records[0] if records else None
                
                class ExecutedSingle:
                    def __init__(self, d):
                        self.data = d
                return ExecutedSingle(data)
        return SingleResult(self)

    def update(self, data):
        class UpdateResult:
            def __init__(self, query, data):
                self.query = query
                self.data = data
            def eq(self, column, value):
                self.query.eq(column, value)
                return self
            def execute(self):
                records = list(self.query.client.store.values())
                for col, val in self.query._filters:
                    records = [r for r in records if r.get(col) == val]
                for r in records:
                    r.update(self.data)
                
                class ExecutedUpdate:
                    def __init__(self, d):
                        self.data = d
                return ExecutedUpdate(records)
        return UpdateResult(self, data)

    def delete(self):
        class DeleteResult:
            def __init__(self, query):
                self.query = query
            def eq(self, column, value):
                self.query.eq(column, value)
                return self
            def execute(self):
                records = list(self.query.client.store.values())
                for col, val in self.query._filters:
                    records = [r for r in records if r.get(col) == val]
                for r in records:
                    if r.get("id") in self.query.client.store:
                        del self.query.client.store[r["id"]]
                
                class ExecutedDelete:
                    def __init__(self):
                        self.data = []
                return ExecutedDelete()
        return DeleteResult(self)

    def execute(self):
        records = list(self.client.store.values())
        for col, val in self._filters:
            records = [r for r in records if r.get(col) == val]
        if self._order_by:
            col, desc = self._order_by
            records = sorted(records, key=lambda x: x.get(col, ""), reverse=desc)
        if self._limit:
            records = records[:self._limit]
        
        class ExecutedList:
            def __init__(self, d):
                self.data = d
        return ExecutedList(records)


class MockStorageBucket:
    def __init__(self, bucket_name):
        self.bucket_name = bucket_name

    def upload(self, path, file, file_options=None):
        logger.info("[Mock Storage] Uploaded file to path: %s", path)
        return {"path": path}

    def get_public_url(self, path):
        return f"https://mock-supabase-storage.local/{self.bucket_name}/{path}"

    def remove(self, paths):
        logger.info("[Mock Storage] Removed paths: %s", paths)
        return paths


class MockStorage:
    def __init__(self):
        self.buckets = {}

    def from_(self, bucket_name):
        if bucket_name not in self.buckets:
            self.buckets[bucket_name] = MockStorageBucket(bucket_name)
        return self.buckets[bucket_name]


class MockSupabaseClient:
    def __init__(self):
        self.store = {}
        self.storage = MockStorage()

    def table(self, table_name):
        return MockQuery(table_name, self)


_supabase_client: Client | MockSupabaseClient | None = None


def get_supabase() -> Client | MockSupabaseClient:
    """Return a cached Supabase client, initializing it on first call."""
    global _supabase_client
    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_KEY", "")
        if not url or not key:
            logger.warning("[Database] SUPABASE_URL or SUPABASE_KEY not set. Using Mock database fallback.")
            _supabase_client = MockSupabaseClient()
            return _supabase_client

        try:
            _supabase_client = create_client(url, key)
            logger.info("[Database] Supabase client initialized → %s", url)
        except Exception as exc:
            logger.warning(
                "[Database] Failed to initialize Supabase client (%s). Falling back to Mock Database.",
                exc
            )
            _supabase_client = MockSupabaseClient()
            
    return _supabase_client

