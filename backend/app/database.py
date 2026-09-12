import logging
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

_engine = None
_session_local = None
_driver_name = None
_connected_url = None


def _sqlite_engine(url: str):
    if url == "sqlite://":
        db_path = settings.database_file
        db_path.parent.mkdir(parents=True, exist_ok=True)
        url = f"sqlite:///{db_path}"
    return create_engine(url, connect_args={"check_same_thread": False})


def _try_connect(url: str):
    is_sqlite = "sqlite" in url
    if is_sqlite:
        engine = _sqlite_engine(url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return engine, "sqlite"
    engine = create_engine(
        url,
        connect_args={"connect_timeout": 3},
        pool_pre_ping=True,
        pool_recycle=3600,
    )
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return engine, "postgresql"


def candidate_urls():
    if settings.db_url:
        yield settings.db_url
    yield settings.preset_postgres_url


def get_engine():
    global _engine, _session_local, _driver_name, _connected_url
    if _engine is not None:
        return _engine

    chosen = None
    for url in candidate_urls():
        try:
            engine, driver = _try_connect(url)
            chosen = (engine, driver, url)
            logger.info("Connected to database via '%s'", url)
            break
        except Exception as exc:
            logger.warning("Could not use database URL '%s': %s", url, exc)

    if chosen is None:
        sqlite_url = f"sqlite:///{settings.database_file}"
        engine, driver = _try_connect(sqlite_url)
        chosen = (engine, driver, sqlite_url)
        logger.warning("Falling back to SQLite database at %s", settings.database_file)

    _engine, _driver_name, _connected_url = chosen
    _session_local = sessionmaker(bind=_engine, autoflush=False, expire_on_commit=False)
    return _engine


def get_driver_name() -> str:
    get_engine()
    return _driver_name


def init_db():
    engine = get_engine()
    Base.metadata.create_all(bind=engine)
    return _driver_name


def get_session():
    get_engine()
    return _session_local()


def get_db():
    session = get_session()
    try:
        yield session
    finally:
        session.close()