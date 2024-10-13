import requests
import json

BASE_URL = "http://localhost:8080"

def test_root():
    response = requests.get(f"{BASE_URL}/")
    print("Root endpoint response:", response.json())

def test_get_user():
    # Test with an existing user
    response = requests.get(f"{BASE_URL}/user/elonmusk")
    print("Get user (existing) response:", response.json())
    
    # Test with a non-existing user
    response = requests.get(f"{BASE_URL}/user/nonexistentuser123456789")
    print("Get user (non-existing) response:", response.json())

def test_sample_x():
    response = requests.get(f"{BASE_URL}/sample_x?username=elonmusk&sampling_text=AI is the future", stream=True)
    
    print("Sample X responses:")
    for line in response.iter_lines():
        if line:
            print(json.loads(line))

if __name__ == "__main__":
    # test_root()
    # test_get_user()
    test_sample_x()
    # print("All tests completed")
