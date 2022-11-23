import cron from "node-cron";

export default defineNitroPlugin((nitroApp) => {
  cron.schedule("*/5 * * * *", () => {
    console.log("Running a task every 5 minutes");
  });
  console.log("Scheduled the cron tasks");
});
