from api import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_sample_x():
    username = "eshaotran"
    response = client.get(f"/sample_x?username={username}")
    assert response.status_code == 200, f"Response error: {response.json()}"

    data = response.json()
    print("Response from sample_x endpoint:", data)

    assert "samples" in data
    assert isinstance(data["samples"], list)
    assert "response_time" in data
    assert isinstance(data["response_time"], int)

    if len(data["samples"]) > 0:
        sample = data["samples"][0]
        assert "user" in sample
        assert "tweets" in sample
        assert isinstance(sample["tweets"], list)


if __name__ == "__main__":
    test_sample_x()
