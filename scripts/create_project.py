from pathlib import Path

# Current working directory
root = Path(".")

# Folders to create

folders = [
    "src/app/api",
    "src/app/core",
    "src/app/rag",
    "src/app/services",
    "src/data",
    "src/templates",
    "src/static",
    "src/uploads",
    "src/tests",
]



# Files to create
files = [
    "src/app/main.py",
    "src/ingest_sample_kb.py",
    "src/requirements.txt",
    "src/run.py",
    ".env",
]


# Create folders
for folder in folders:
    (root / folder).mkdir(parents=True, exist_ok=True)


# Create files
for file in files:
    (root / file).touch(exist_ok=True)



print("Project structure created successfully.")
