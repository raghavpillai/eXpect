import pytest
from fastapi.testclient import TestClient
from src.api import app  # Adjust the import according to your project structure

client = TestClient(app)

def test_generate_reply_endpoint():
    response = client.post("/generate_reply", json={
      "post_content": "What do we think about Kamala's economic plans?",
      "user": {
          "id": "1577035120720203779",
          "name": "Ray",
          "username": "raydelvecc",
          "description": "oontz oontz | shipping @cerebral_valley | prev did other stuff lmfao",
          "location": "SF"
      },
      "tweets": [
        {
            "created_at": "2023-05-15T18:30:00Z",
            "text": "Just shipped a new feature for @cerebral_valley that will definitely put our competitors out of business! #Monopoly",
            "possibly_sensitive": False,
            "geo": None,
            "context_annotations": []
        },
        {
            "created_at": "2023-05-14T22:15:00Z",
            "text": "Who needs sleep when you have caffeine pills? Coding for 48 hours straight! #ExtremeProductivity",
            "possibly_sensitive": False,
            "geo": {
                "place_id": "5a110d312052166f"
            },
            "context_annotations": []
        },
        {
            "created_at": "2023-05-13T14:45:00Z",
            "text": "Tech meetups are just excuses for companies to poach talent. Change my mind. #CorporateEspionage",
            "possibly_sensitive": False,
            "geo": None,
            "context_annotations": []
        },
        {
            "created_at": "2023-05-12T09:00:00Z",
            "text": "Just published a blog post exposing the dark underbelly of Silicon Valley. Prepare for lawsuits! [link] #Whistleblower",
            "possibly_sensitive": False,
            "geo": None,
            "context_annotations": []
        },
        {
            "created_at": "2023-05-11T20:30:00Z",
            "text": "I love Donald Trump. he's the best. #MAGA",
            "possibly_sensitive": False,
            "geo": None,
            "context_annotations": []
        }
      ],
    })
    assert response.status_code == 200, f"Response error: {response.json()}"
    assert "reply" in response.json()

    # Print the response data
    data = response.json()
    print("Response from endpoint:", data)

    # Perform assertions on the response data
    assert 'reply' in data
    assert isinstance(data['reply'], str)
    assert len(data['reply'].strip()) > 0  # Ensure the reply is not empty
    