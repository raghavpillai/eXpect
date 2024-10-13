import json
import os
import time
from typing import Any


def calculate_time_remaining(reset_time: int) -> tuple[int, int]:
    """Calculate minutes and seconds remaining until rate limit reset."""
    current_time = int(time.time())
    time_remaining = max(0, reset_time - current_time)
    minutes_remaining = time_remaining // 60
    seconds_remaining = time_remaining % 60
    return minutes_remaining, seconds_remaining


def print_rate_limits(headers: list[str, Any]) -> None:
    """Print rate limits from an API response header."""
    for key, value in headers.items():
        if "limit" in key.lower():
            if "reset" in key.lower():
                minutes, seconds = calculate_time_remaining(int(value))
                print(f"{key}: {minutes} minutes and {seconds} seconds remaining")
            else:
                print(f"{key}: {value}")
    print("\n")


def load_json_file(filename: str) -> list[str, Any]:
    """Load JSON data from a file or return an empty dict if file doesn't exist."""
    if os.path.exists(filename):
        with open(filename, "r") as f:
            return json.load(f)
    return {}


def save_to_json(filename: str, key: str, data: Any) -> None:
    """Save data with a specific key to the input filename."""
    file_data = load_json_file(filename)
    file_data[key] = data
    with open(filename, "w") as f:
        json.dump(file_data, f)
