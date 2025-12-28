type TreezAccessTokenResponse = {
  resultCode: "SUCCESS";
  resultReason: null;
  access_token: string;
  expires_at: string;
  refresh_token: string;
  expires: string;
  expires_in: string;
};

export async function getTreezAccessToken() {
  const TREEZ_CLIENT_ID = process.env.TREEZ_CLIENT_ID;
  const TREEZ_API_KEY = process.env.TREEZ_API_KEY;
  const TREEZ_DISPENSARY = process.env.TREEZ_DISPENSARY;

  if (!TREEZ_CLIENT_ID || !TREEZ_API_KEY || !TREEZ_DISPENSARY) {
    throw new Error(
      "TREEZ_CLIENT_ID, TREEZ_API_KEY, or TREEZ_DISPENSARY is not set"
    );
  }

  const response = await fetch(
    `https://api.treez.io/v2.0/dispensary/${TREEZ_DISPENSARY}/config/api/gettokens`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: TREEZ_CLIENT_ID,
        apikey: TREEZ_API_KEY,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to get Treez access token: ${await response.json()}`
    );
  }

  const data: TreezAccessTokenResponse = await response.json();
  return data;
}
