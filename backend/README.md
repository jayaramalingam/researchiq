# ResearchIQ Backend

FastAPI Python backend for ResearchIQ.

## Setup

1. Make sure you have Python 3.10+ installed.
2. Initialize and activate the virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy environment configuration and configure values:
   ```bash
   copy .env.example .env
   ```

## Running the Backend

Start the development server:
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Running Tests

Execute tests using pytest:
```bash
pytest
```
