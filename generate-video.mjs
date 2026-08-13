/**
 * End-to-end text-to-video via the Runway Dev SDK.
 * Docs: https://docs.dev.runwayml.com/ai-context.md
 * Endpoint: POST /v1/text_to_video (model: seedance2_mini)
 *
 * Auth: set RUNWAYML_API_SECRET in the environment or a local .env file.
 * The SDK also sends X-Runway-Version automatically.
 */
import "dotenv/config";
import RunwayML, { TaskFailedError } from "@runwayml/sdk";

if (!process.env.RUNWAYML_API_SECRET) {
  console.error(
    "RUNWAYML_API_SECRET is not set.\n" +
      "Add it to a .env file in this directory (see .env.example),\n" +
      "or export it in your shell. Do not paste the key into chat."
  );
  process.exit(1);
}

const client = new RunwayML();

try {
  // Per-model fields from https://docs.dev.runwayml.com/api.md
  // seedance2_mini: promptText required; duration 4–15; ratio from allowed list
  const task = await client.textToVideo
    .create({
      model: "seedance2_mini",
      promptText:
        "A serene mountain landscape at sunrise with mist rolling through the valleys, cinematic soft light",
      ratio: "1280:720",
      duration: 4,
      audio: true,
    })
    .waitForTaskOutput();

  console.log("Task succeeded.");
  console.log("Task id:", task.id);
  console.log("Output URL(s):", task.output);
  console.log(
    "Note: output URLs are temporary — download anything you want to keep."
  );
} catch (error) {
  if (error instanceof TaskFailedError) {
    console.error("Generation failed:");
    console.error(error.taskDetails);
    process.exit(1);
  }
  throw error;
}
