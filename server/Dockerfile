FROM python:3.12-slim-bookworm

WORKDIR /api

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates


# uv
ADD https://astral.sh/uv/install.sh /uv-installer.sh
RUN sh /uv-installer.sh && rm /uv-installer.sh
ENV PATH="/root/.cargo/bin/:$PATH"

# Copy source files to the container
COPY ./src/ /src/

ENV PATH="/api/.venv/bin:$PATH"

# Use the virtual environment's Python and Uvicorn for the command
CMD ["uv", "run", "uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "4"]
