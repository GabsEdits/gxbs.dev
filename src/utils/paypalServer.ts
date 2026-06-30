type PayPalEnvironment = "sandbox" | "live";

type PayPalTokenResponse = {
  access_token: string;
};

const readPayPalConfig = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const env = (process.env.PAYPAL_ENV ?? "sandbox") as PayPalEnvironment;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET.");
  }

  return { clientId, clientSecret, env };
};

export const getPayPalBaseUrl = () => {
  const { env } = readPayPalConfig();
  return env === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
};

export const getPayPalAccessToken = async () => {
  const { clientId, clientSecret } = readPayPalConfig();
  const baseUrl = getPayPalBaseUrl();
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenResponse.ok) {
    const details = await tokenResponse.text();
    throw new Error(
      `PayPal token request failed: ${details || tokenResponse.statusText}`,
    );
  }

  const tokenJson = (await tokenResponse.json()) as PayPalTokenResponse;
  return tokenJson.access_token;
};
