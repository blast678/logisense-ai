# sources package — load .env on import so os.getenv() works in all contexts
from dotenv import load_dotenv as _load_dotenv
_load_dotenv()
