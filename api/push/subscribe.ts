import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  console.log(
    "Push subscription received:",
    req.body,
  );

  return res.status(200).json({
    success: true,
    message: "Push subscription received",
  });
}