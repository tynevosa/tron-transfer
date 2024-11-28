export const postDiscord = (message: string) => {
  const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK || 'https://discord.com/api/webhooks/1311597932574933063/GGUFVn47lS41ltsjcYOMo0ji5vUVMlIvryu97WWb6NPFxFdW06Hr5FhQnaXrS-H7wMlD';

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