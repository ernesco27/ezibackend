import dotenv from "dotenv";

dotenv.config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

export async function sendSMS(to, content) {
  const query = new URLSearchParams({
    clientId,
    clientSecret,
    from: "EziData",
    to,
    content,
  }).toString();

  try {
    const resp = await fetch(
      `https://smsc.hubtel.com/v1/messages/send?${query}`,

      { method: "GET" }
    );

    const data = await resp.text();
    console.log(`SMS sent successfully: ${data}`);
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
}
