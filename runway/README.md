# Runway Dev API — text-to-video quickstart

A minimal, end-to-end example that generates a video from a text prompt using the
[Runway Dev API](https://docs.dev.runwayml.com/) and the official Node SDK
([`@runwayml/sdk`](https://www.npmjs.com/package/@runwayml/sdk)).

The source of truth for setup and API behavior is
[`https://docs.dev.runwayml.com/llms.txt`](https://docs.dev.runwayml.com/llms.txt).

## How it works

Generation on Runway is **asynchronous**:

1. `POST /v1/text_to_video` creates a task and returns a task id.
2. Poll `GET /v1/tasks/{id}` until the status is terminal (`SUCCEEDED` / `FAILED`).
3. Read the output URL(s) from a `SUCCEEDED` task. Output URLs are temporary — download what you keep.

The SDK's `.waitForTaskOutput()` does the polling (with backoff) for you and throws
`TaskFailedError` if the task fails (for example, content moderation).

This example uses the **`seedance2_mini`** model. On `POST /v1/text_to_video` that model
requires only `promptText` and `model`; `ratio` and `duration` are optional (we set them
explicitly here). Request fields are per-model — never carry `ratio`/`duration` from one
model to another. See [the models guide](https://docs.dev.runwayml.com/guides/models.md).

## Setup

1. Install dependencies:

   ```bash
   cd runway
   npm install
   ```

2. Add your API key. **Do not paste it into chat or hard-code it.**

   ```bash
   cp .env.example .env
   # then edit .env and set RUNWAYML_API_SECRET to your real key
   ```

   Get a key from the [Runway Developer Portal](https://dev.runwayml.com/). The SDK reads it
   from the `RUNWAYML_API_SECRET` environment variable. `.env` is gitignored.

## Run

```bash
npm run generate
# or pass a custom prompt:
npm run generate -- "A neon jellyfish drifting through a dark ocean"
```

On success it prints the temporary output video URL(s).
