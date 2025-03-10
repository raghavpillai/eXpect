# eXpect: Predict the Truth

![Landing Page](client/public/landing.png)

[xAI Repost](https://x.com/xai/status/1846989686549696900)


[eXpect](https://tryexpect.com/login) is the truth-seeking tool. It uses a multi-agent interface and large-scale simulation to predict human reactions to tweets, speeches, and any other input text. You can't do this with most AIs - they're censored and cannot always reflect the full spectrum of human opinion. Using Grok (unfiltered & diverse) and X (to crowdsource real human personas), we can now simulate entire communities' raw reactions to any topic (politics, consumer behavior, etc). eXpect will allow the world to more accurately identify the communal source of truth... to provide a crystal ball into the future. And, as a bonus, on X you can predict how many likes your tweet will get!

**Check it out at [tryexpect.com](https://tryexpect.com/login)!**

# Stack

This is a fun way to explore these very new APIs:

- X API:
  - https://developer.x.com/en/docs/x-api/getting-started/make-your-first-request
  - API Reference: https://developer.x.com/en/docs/api-reference-index
- xAI API:
  - https://docs.x.ai/api/integrations

Note: you'll need API keys (into .env) to run. We use a round robin key system (see api.py) to rotate with API limits. Populate any of the keys to use if you just have one of each!

# How it Works

1. Pulling X Data: we pull 1,000 of your followers, sample 100 at random, and then pull 100 of their tweets all simultaneously via the X API.
2. Simulation: we simultaneously make 100 calls to Grok mini. Each digests an individual's Twitter profile and tweets in order to simulate their reaction to a query.
3. Display: we display a histogram of the community's sentiment (float) and a host of reactions (string).

# Installation and Layout

* Frontend Steps
    * Ensure your `.env` file is correctly populated according to `.env.example`
    * `pnpm install`
    * `pnpm dev`
     * ***NOTE: alternatively, you can follow the steps in the `Dockerfile` to run the frontend client!***
* Backend Steps
    * Ensure your `.env` file is correctly populated according to `.env.example`
    * `python3 -m venv venv`
    * `source venv/bin/activate`
    * `pip3 install -r requirements.txt`
        * Alternatively, you can use `uv` to install as well!
    * Then, you can run `uvicorn src.api:app --host 0.0.0.0 --port 8080 --reload` from the `/server` directory to locally spin up the API!
    * ***NOTE: alternatively, you can follow the steps in the `Dockerfile` to run the API!***
    
# Credits
Developed by [Raghav Pillai](https://x.com/rag_pil), [Ray Del Vecchio](https://x.com/raydelvecc), [Ethan Shaotran](https://x.com/EShaotran), and [Giovanni D'Antonio](https://x.com/GiovanniMDanto2) during the first xAI hackathon in San Francisco.

# Miscellaneous
We were running into some rate limits, so tried to add an OpenAI API fallback. It didn't go very well. Grok is too good.

![Evidence](client/public/grokbetter.png)
