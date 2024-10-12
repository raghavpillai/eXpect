#!/bin/bash
uv run uvicorn src.api:app --reload --lifespan on --host 0.0.0.0 --port 8080
