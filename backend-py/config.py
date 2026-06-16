import os
from urllib.parse import unquote
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Decoded DB connection params
_db_url = DATABASE_URL or ""
if _db_url.startswith("postgresql://"):
    rest = _db_url[len("postgresql://"):]
    user_pass, host_port_db = rest.split("@", 1)
    user, pass_encoded = user_pass.split(":", 1)
    DB_USER = user
    DB_PASSWORD = unquote(pass_encoded)
    host_port, DB_NAME = host_port_db.split("/", 1)
    if ":" in host_port:
        DB_HOST, DB_PORT = host_port.split(":", 1)
    else:
        DB_HOST = host_port
        DB_PORT = "5432"
else:
    DB_USER = DB_PASSWORD = DB_HOST = DB_PORT = DB_NAME = ""
