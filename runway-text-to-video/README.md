# Runway Dev API — text-to-video example

Minimal, working example that calls `POST /v1/text_to_video` on the
[Runway Dev API](https://docs.dev.runwayml.com/llms.txt) using the `seedance2_mini`
model, and waits for the generated video.

## Setup

1. Get an API key from the [Developer Portal](https://dev.runwayml.com/).
2. Copy `.env.example` to `.env` and set `RUNWAYML_API_SECRET` to your key:

   ```sh
   cp .env.example .env
   # then edit .env and paste your key as the value of RUNWAYML_API_SECRET
   ```

   `.env` is git-ignored, so your key is never committed. The SDK reads the
   key from the `RUNWAYML_API_SECRET` environment variable automatically —
   never hard-code it in source or share it in chat/issues.

3. Install dependencies:

   ```sh
   npm install
   ```

4. Run:

   ```sh
   npm start
   ```

## What it does

`index.js`:

- Loads `RUNWAYML_API_SECRET` from `.env` via `dotenv`.
- Calls `client.textToVideo.create({ model: "seedance2_mini", promptText, ratio, duration })`
  to start an asynchronous generation task (`POST /v1/text_to_video`).
- Calls `.waitForTaskOutput()`, which polls `GET /v1/tasks/{id}` with backoff
  until the task reaches `SUCCEEDED` or `FAILED`, and throws `TaskFailedError`
  on failure.
- Prints the resulting video URL. Output URLs are temporary — download
  anything you want to keep.

## Choosing a different model

`seedance2_mini` is a good low-cost starting point for text-to-video. Other
`/v1/text_to_video` models (`gen4.5`, `seedance2`, `seedance2_5`, `veo3.1`,
`hailuo3`, etc.) accept different required fields (e.g. different `ratio`
values, `duration` ranges, and prompt length limits) — see
[the model catalog](https://docs.dev.runwayml.com/guides/models.md) and the
[generated API reference](https://docs.dev.runwayml.com/api.md) before
switching models, and never reuse `ratio`/`duration` values across models.
