export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Espera: /?channels=@a,@b,@c
    const param = url.searchParams.get("channels");

    if (!param) {
      return json({ error: "missing channels param" });
    }

    const channels = param.split(",").map(c => c.trim());

    const results = {};

    await Promise.all(
      channels.map(async (channel) => {
        try {
          const liveUrl = `https://youtube.com/${channel}/live`;

          const res = await fetch(liveUrl, {
            redirect: "follow"
          });

          const finalUrl = res.url;

          // extrai videoId
          const match = finalUrl.match(/v=([a-zA-Z0-9_-]{6,})/);

          if (match) {
            results[channel] = match[1];
          } else {
            results[channel] = null;
          }

        } catch (e) {
          results[channel] = null;
        }
      })
    );

    return json(results);
  }
};

function json(data) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
