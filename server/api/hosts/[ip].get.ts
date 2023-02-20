export default defineEventHandler(async (event) => {
  if (event.context.params) {
    const key = process.env.IPINFO_APIKEY;
    const response: any[] = await $fetch(
      "https://ipinfo.io/" + event.context.params.ip + "/json?token=" + key
    );
    return response;
  }
});
