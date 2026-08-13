import { config } from "dotenv";
import RunwayML, { TaskFailedError } from "@runwayml/sdk";

config({ quiet: true });

if (!process.env.RUNWAYML_API_SECRET) {
  console.error(
    "RUNWAYML_API_SECRET is not set. Add it to .env before running this example.",
  );
  process.exitCode = 1;
} else {
  const client = new RunwayML();

  try {
    const task = await client.textToVideo
      .create({
        model: "seedance2_mini",
        promptText:
          "A cinematic close-up of wildflowers swaying in a gentle breeze at sunrise, natural motion, warm golden light",
        ratio: "1280:720",
        duration: 4,
        audio: false,
      })
      .waitForTaskOutput();

    console.log("Task complete:", task.id);
    console.log("Video URL:", task.output[0]);
  } catch (error) {
    if (error instanceof TaskFailedError) {
      console.error("The video failed to generate.");
      console.error(error.taskDetails);
      process.exitCode = 1;
    } else {
      throw error;
    }
  }
}
