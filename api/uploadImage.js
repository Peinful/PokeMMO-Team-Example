export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Vercel automatically parses the incoming FormData
  const file = req.files.image;

  // We create a new FormData to send to Discord
  const formData = new FormData();
  formData.append('file', new Blob([file.data]), file.name);
  formData.append('payload_json', JSON.stringify({
    username: "Shiny Dex Uploader",
    content: "New character image uploaded.",
  }));

  try {
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!discordWebhookUrl) {
      throw new Error("Discord webhook URL is not configured.");
    }

    const discordRes = await fetch(discordWebhookUrl, {
      method: 'POST',
      body: formData,
    });

    if (!discordRes.ok) {
      const errorText = await discordRes.text();
      throw new Error(`Discord API Error: ${discordRes.status} ${errorText}`);
    }

    const discordData = await discordRes.json();
    const imageUrl = discordData.attachments[0].url;

    // Send the public image URL back to the website
    res.status(200).json({ url: imageUrl });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload image.' });
  }
}