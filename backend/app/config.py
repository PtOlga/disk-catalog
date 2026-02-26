from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    omdb_api_key: str = ""
    google_cloud_project: str = ""
    firebase_credentials_path: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
