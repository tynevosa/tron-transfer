export const postDiscord = (message: string) => {
  const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK || '';

  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: "@everyone",
      embeds: [
        {
          "description": message,
          "color": 16711680,
        }
      ],
      username: "Tron-Transfer"
    }),
  })
}