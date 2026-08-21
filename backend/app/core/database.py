"""SQLAlchemy engine, session factory and declarative base."""
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import settings

# On Vercel each request may land on a fresh function instance, and holding a
# pool open in one would waste a slot on Supabase's pooler without ever being
# reused. NullPool opens a connection per request and closes it again; the
# hosted pooler is the thing doing the real pooling. Locally, where the process
# is long-lived, a normal pool is the right choice.
_serverless = bool(os.getenv("VERCEL"))

engine = create_engine(
    settings.database_dsn,
    pool_pre_ping=True,
    future=True,
    **({"poolclass": NullPool} if _serverless else {"pool_recycle": 300}),
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    """Declarative base every model inherits from."""


def get_db():
    """FastAPI dependency that yields a request-scoped session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
