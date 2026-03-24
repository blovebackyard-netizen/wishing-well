import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

function getAmountFromGift(diamonds, repeatCount) {
  const base = Math.max(1, Number(diamonds || 1));
  const repeat = Math.max(1, Number(repeatCount || 1));
  return Math.min(80, Math.max(6, base * repeat));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const body = req.body || {};

    const username =
      body.username ||
      body.nickname ||
      body.userName ||
      body.user?.nickname ||
      "Someone";

    const giftName =
      body.giftName ||
      body.gift?.name ||
      body.eventName ||
      "A gift";

    const diamonds =
      Number(body.diamondCount) ||
      Number(body.coins) ||
      Number(body.gift?.diamond_count) ||
      1;

    const repeatCount =
      Number(body.repeatCount) ||
      Number(body.repeat) ||
      Number(body.gift?.repeat_count) ||
      1;

    const amount = getAmountFromGift(diamonds, repeatCount);

    await pusher.trigger("wishing-well", "gift-received", {
      username,
      giftName,
      diamonds,
      repeatCount,
      amount,
      raw: body
    });

    return res.status(200).json({
      ok: true,
      username,
      giftName,
      diamonds,
      repeatCount,
      amount
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || "Server error"
    });
  }
}
