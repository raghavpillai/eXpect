import time
import json
import os

def print_rate_limits(headers):
    """
    Prints the rate limits from an API response header if we want.
    """
    for key, value in headers.items():
        if 'limit' in key.lower():
            if 'reset' in key.lower():
                current_time = int(time.time())
                reset_time = int(value)
                time_remaining = max(0, reset_time - current_time)
                minutes_remaining = time_remaining // 60
                seconds_remaining = time_remaining % 60
                print(f"{key}: {minutes_remaining} minutes and {seconds_remaining} seconds remaining")
            else:
                print(f"{key}: {value}")
    print('\n')

def save_to_json(filename, key, data):
    """
    Saves data with a specific key to the input filename.
    """
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            file_data = json.load(f)
    else:
        file_data = {}
    
    file_data[key] = data
    
    with open(filename, 'w') as f:
        json.dump(file_data, f)
