import json
from typing import Any, Dict

import requests

BASE_URL = "http://localhost:8080"


def make_request(endpoint: str) -> Dict[str, Any]:
    """Make a GET request to the specified endpoint and return the JSON response."""
    response = requests.get(f"{BASE_URL}/{endpoint}")
    return response.json()


def print_response(description: str, response: Dict[str, Any]) -> None:
    """Print a formatted response with a description."""
    print(f"{description}:", response)


def test_root() -> None:
    """Test the root endpoint."""
    response = make_request("")
    print_response("Root endpoint response", response)


def test_get_user() -> None:
    """Test the get user endpoint with existing and non-existing users."""
    existing_user = make_request("user/elonmusk")
    print_response("Get user (existing) response", existing_user)

    non_existing_user = make_request("user/nonexistentuser123456789")
    print_response("Get user (non-existing) response", non_existing_user)


def test_sample_x() -> None:
    """Test the sample_x endpoint with streaming response."""
    response = requests.get(
        f"{BASE_URL}/sample_x?username=elonmusk&sampling_text=AI is the future",
        stream=True,
    )

    print("Sample X responses:")
    for line in response.iter_lines():
        if line:
            print(json.loads(line))


if __name__ == "__main__":
    # test_root()
    # test_get_user()
    test_sample_x()
    # print("All tests completed")
