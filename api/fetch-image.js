export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).send("Missing or invalid 'url' parameter.");
  }

  const allowedHosts = [
    "user-images.githubusercontent.com",
    "github-production-user-asset-6210df.s3.amazonaws.com"
  ];

  try {
    const parsedUrl = new URL(url);

    if (!allowedHosts.includes(parsedUrl.hostname)) {
      return res.status(403).send("Blocked: host not allowed.");
    }

    const imageRes = await fetch(url);
    if (!imageRes.ok) {
      return res.status(imageRes.status).send("Failed to fetch image.");
    }

    const contentType = imageRes.headers.get("content-type") || "application/octet-stream";
    const buffer = await imageRes.arrayBuffer();

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // cache for 1 day
    res.setHeader("Access-Control-Allow-Origin", "*"); // allow any frontend
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).send("Proxy error: " + err.message);
  }
}
