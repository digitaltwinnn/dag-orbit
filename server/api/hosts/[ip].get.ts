export const config = {
  runtime: "edge",
};

export default defineEventHandler(async (event) => {
  event.node.res.setHeader("Cache-Control", "s-maxage=86400");

  if (event.context.params) {
    const key = process.env.IPINFO_APIKEY;
    const response: any[] = await $fetch(
      "https://ipinfo.io/" + event.context.params.ip + "/json?token=" + key
    );
    return response;
  }
});
