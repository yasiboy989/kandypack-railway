from .database import Base,engine
from .models import User

print("Creating database tables...")
Base.metadata.create_all(bind = engine)