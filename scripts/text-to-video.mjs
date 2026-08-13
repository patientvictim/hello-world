import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import RunwayML, { TaskFailedError } from "@runwayml/sdk";

if (!process.env.RUNWAYML_API_SECRET) {
  console.error(
    "Missing RUNWAYML_API_SECRET. Copy .env.example to .env and add your API key from https://dev.runwayml.com/"
  );
  process.exit(1);
}

const client = new RunwayML();

const promptText =
  process.argv.slice(2).join(" ") ||
  "A timelapse on a sunny day with clouds flying by over a calm lake";

try {
  console.log("Starting text-to-video with seedance2_mini...");
  console.log(`Prompt: ${promptText}`);

  const task = await client.textToVideo
    .create({
      model: "seedance2_mini",
      promptText,
      ratio: "1280:720",
      duration: 5,
    })
    .waitForTaskOutput();

  const videoUrl = task.output?.[0];
  if (!videoUrl) {
    throw new Error("Task succeeded but no output URL was returned.");
  }

  console.log("Task complete.");
  console.log("Output URL:", videoUrl);

  const outputDir = path.join(process.cwd(), "output");
  await fs.mkdir(outputDir, { recursive: true });

  const response = await fetch(videoUrl);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
  }

  const outputPath = path.join(outputDir, "seedance2_mini.mp4");
  await fs.writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
  console.log("Saved to:", outputPath);
} catch (error) {
  if (error instanceof TaskFailedError) {
    console.error("The video failed to generate.");
    console.error(error.taskDetails);
    process.exit(1);
  }

  throw error;
}
