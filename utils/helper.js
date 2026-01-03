import crypto from "crypto";

export const generateHash = (payload) =>
  crypto.createHash("sha256").update(payload).digest("hex");

export const getConcatedValueFromObject = ({ payload = {}, keys = [] }) => {
  if (Object.keys(payload)?.length === 0 || keys?.length === 0) {
    throw new Error(`Provide valid values for payload & keys`);
  }
  const arr = (Object.entries(payload ?? {}) ?? [])?.sort((a, b) =>
    a[0]?.localeCompare(b[0]),
  );
  return arr.reduce(
    (prev, [key, value]) =>
      keys.includes(key) ? (prev += value + "-") : (prev += ""),
    "",
  );
};
