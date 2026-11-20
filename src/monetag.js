import createAdHandler from "monetag-tg-sdk";

const zoneId = Number(import.meta.env.VITE_MONETAG_ZONE_ID || 0);
let handler;

export const hasMonetagZone = Number.isSafeInteger(zoneId) && zoneId > 0;

export async function playRewardedAd(ymid) {
  if (!hasMonetagZone) {
    throw new Error("Monetag is not configured yet. The ad zone ID is still required.");
  }
  if (!handler) handler = createAdHandler(zoneId);
  return handler({ ymid, requestVar: "boxearn_rewarded_ad" });
}
