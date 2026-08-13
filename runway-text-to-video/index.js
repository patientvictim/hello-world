// Minimal end-to-end example: generate a video from a text prompt using the
// Runway Dev API (POST /v1/text_to_video), following
// https://docs.dev.runwayml.com/llms.txt / https://docs.dev.runwayml.com/ai-context.md
//
// Setup:
//   1. Copy .env.example to .env and set RUNWAYML_API_SECRET to your API key.
//      Get a key from the Developer Portal: https://dev.runwayml.com/
//   2. npm install
//   3. npm start

import "dotenv/config";
import RunwayML, { TaskFailedError } from "@runwayml/sdk";

if (!process.env.RUNWAYML_API_SECRET) {
  console.error(
    "Missing RUNWAYML_API_SECRET. Copy .env.example to .env and set your API key there."
  );
  process.exit(1);
}

// The SDK reads RUNWAYML_API_SECRET from the environment automatically.
const client = new RunwayML();

async function main() {
  try {
    // seedance2_mini: text/image/video -> video. Only the fields documented
    // for this model on /v1/text_to_video are valid here (do not reuse
    // ratio/duration values from other models).
    const task = await client.textToVideo
      .create({
        model: "seedance2_mini",
        promptText:
          "A timelapse on a sunny day with clouds flying by over a mountain valley",
        ratio: "1280:720",
        duration: 5,
      })
      // Polls GET /v1/tasks/{id} with backoff until the task reaches
      // SUCCEEDED or FAILED, per the documented task lifecycle.
      .waitForTaskOutput();

    console.log("Task complete:", task);
    console.log("Video URL:", task.output[0]);
  } catch (error) {
    if (error instanceof TaskFailedError) {
      console.error("The video failed to generate.");
      console.error(error.taskDetails);
    } else {
      throw error;
    }
  }
}

main();
