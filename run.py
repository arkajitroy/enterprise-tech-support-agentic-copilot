import uvicorn

# Launch the Uvicorn ASGI server hosting the FastAPI application
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8080, reload=True)
