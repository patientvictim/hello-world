// Minimal end-to-end Runway Dev API example: text -> video.
//
// Docs (source of truth): https://docs.dev.runwayml.com/llms.txt
//   - Generation is asynchronous: create a task, then poll GET /v1/tasks/{id}.
//   - The official SDK reads the key from RUNWAYML_API_SECRET and handles the
//     required `X-Runway-Version` header, retries, and polling for you.
//   - Request bodies are a discriminated union keyed on `model`, so the valid
//     fields depend on the chosen model. For `seedance2_mini` on
//     POST /v1/text_to_video, only `promptText` and `model` are required;
//     `ratio` and `duration` are optional.
//
// Run with:  npm run generate   (loads .env via `node --env-file`)

import RunwayML, { TaskFailedError } from "@runwayml/sdk";

if (!process.env.RUNWAYML_API_SECRET) {
  console.error(
    [
      "RUNWAYML_API_SECRET is not set.",
      "",
      "Add your Runway Dev API key to runway/.env (copy from .env.example):",
      "  RUNWAYML_API_SECRET=your_key_here",
      "",
      "Never hard-code the key or paste it into shared chats.",
    ].join("\n"),
  );
  process.exit(1);
}

// The SDK picks up RUNWAYML_API_SECRET from the environment automatically.
const client = new RunwayML();

const model = "seedance2_mini";
const promptText =
  process.argv.slice(2).join(" ") ||
  "A calm timelapse of a coastal city at golden hour, clouds drifting over the skyline, gentle waves below";

async function main() {
  console.log(`Creating text_to_video task (model=${model})...`);

  try {
    // `.waitForTaskOutput()` starts the task and polls GET /v1/tasks/{id}
    // with backoff until the task reaches a terminal state. It throws
    // TaskFailedError if the task ends as FAILED (e.g. content moderation).
    const task = await client.textToVideo
      .create({
        model,
        promptText,
        // ratio/duration are optional for seedance2_mini; include them to be explicit.
        ratio: "1280:720",
        duration: 5,
      })
      .waitForTaskOutput();

    console.log("Task SUCCEEDED.");
    console.log("Output URLs (temporary — download what you want to keep):");
    for (const url of task.output ?? []) {
      console.log(`  ${url}`);
    }
  } catch (error) {
    if (error instanceof TaskFailedError) {
      console.error("Task FAILED:", JSON.stringify(error.taskDetails, null, 2));
      process.exit(1);
    }
    throw error;
  }
}

main().catch((error) => {
  console.error("Request error:", error);
  process.exit(1);
});
