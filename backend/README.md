# FINCLOSURE Backend

FastAPI-powered backend services for AI Financial Estate Discovery & Closure Platform.

## Architecture Overview

- **`app/api/`**: API route declarations and dependency injection.
- **`app/core/`**: Core configurations, logging, and custom exceptions.
- **`app/models/`**: Domain and database entity models.
- **`app/schemas/`**: Pydantic request and response schemas.
- **`app/services/`**: Pure business logic (Document Processing, Groq AI, Estate Radar, Claims, Tracking, Preparation).
- **`app/integrations/`**: External service adapters (Firebase, Official pathway registries).
- **`app/utils/`**: Helper utilities for files, text, and dates.
- **`tests/`**: Unit and integration test suites.
- **`data/`**: Demo data, sample documents, and extracted artifacts.

## Getting Started

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Or on Windows: .venv\Scripts\Activate.ps1
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set environment variables based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
