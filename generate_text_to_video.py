#!/usr/bin/env python3
"""Generate a video from text with the Runway Dev API.

Uses POST /v1/text_to_video via the official Python SDK (`runwayml`).
The SDK reads `RUNWAYML_API_SECRET` from the environment, sends
`X-Runway-Version`, and `wait_for_task_output()` polls GET /v1/tasks/{id}
until the task is SUCCEEDED or FAILED.

Setup:
  1. pip install -r requirements.txt
  2. Copy .env.example to .env and set RUNWAYML_API_SECRET
     (do not paste the key into chat or commit it)
  3. python generate_text_to_video.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from urllib.request import urlretrieve

from dotenv import load_dotenv
from runwayml import RunwayML, TaskFailedError, TaskTimeoutError

ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = ROOT / "output"

# seedance2_mini on POST /v1/text_to_video (see https://docs.dev.runwayml.com/api.md):
# required: model, promptText (max 3500)
# optional: duration 4–15, ratio from the 480p/720p set, audio (default true)
MODEL = "seedance2_mini"
RATIO = "1280:720"
DURATION = 4
PROMPT = "A timelapse on a sunny day with clouds flying by over a quiet hillside"


def main() -> int:
    load_dotenv(ROOT / ".env")
    if not os.environ.get("RUNWAYML_API_SECRET"):
        print(
            "RUNWAYML_API_SECRET is not set.\n"
            "Copy .env.example to .env and add your Runway API key there.\n"
            "Do not paste the key into chat or commit it.\n"
            "Create a key at https://dev.runwayml.com/ (API Keys tab).",
            file=sys.stderr,
        )
        return 1

    client = RunwayML()
    print(f"Starting text-to-video model={MODEL} duration={DURATION}s ratio={RATIO}")

    try:
        task = client.text_to_video.create(
            model=MODEL,
            prompt_text=PROMPT,
            ratio=RATIO,
            duration=DURATION,
            audio=True,
        )
        print(f"Task created: {task.id}")
        print("Waiting for task output (SDK polls until SUCCEEDED or FAILED)...")
        result = task.wait_for_task_output()
    except TaskFailedError as exc:
        print("The video failed to generate.", file=sys.stderr)
        print(exc.task_details, file=sys.stderr)
        return 1
    except TaskTimeoutError:
        print(
            "Timed out waiting for the task. It may still be running on Runway.",
            file=sys.stderr,
        )
        return 1

    print(f"Task complete: status={result.status}")
    output = getattr(result, "output", None)
    if not output:
        print("No output URLs on the completed task.", file=sys.stderr)
        return 1

    OUTPUT_DIR.mkdir(exist_ok=True)
    video_url = output[0]
    dest = OUTPUT_DIR / f"{result.id}.mp4"
    print(f"Downloading output (temporary URL) to {dest}")
    urlretrieve(video_url, dest)
    print(f"Saved {dest}")
    print(f"Remote URL (expires in 24–48 hours): {video_url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
