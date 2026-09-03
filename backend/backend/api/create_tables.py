from api.database import engine, Base

# Import all models
from api.models.user import User
from api.models.role import Role
from api.models.department import Department
from api.models.document import Document
from api.models.activity_log import ActivityLog

Base.metadata.create_all(bind=engine)

print("Tables created successfully!")