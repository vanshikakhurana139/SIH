from fastapi import FastAPI

app = FastAPI(title="SENTINEL Backend")

@app.get("/")
def read_root():
    return {"status": "SENTINEL backend is running"}