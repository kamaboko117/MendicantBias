import { Mendicant } from "../../../../classes/Mendicant";

const getToken = async () => {
  const osuClientId = process.env.ID;
  const osuClientSecret = process.env.SECRET;

  if (!osuClientId || !osuClientSecret) {
    throw new Error("Missing osuClientId or osuClientSecret");
  }

  const response = await fetch("https://osu.ppy.sh/oauth/token", {
    method: "POST",
    body: JSON.stringify({
      client_id: osuClientId,
      client_secret: osuClientSecret,
      grant_type: "client_credentials",
      scope: "public",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data.access_token;
};

export const getMatch = async (matchId: string, mendicant: Mendicant) => {
  const token = await getToken();

  const match = await fetch(mendicant.osuApiUrl + `/matches/${matchId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .catch((err) => {
      return null;
    });

  return match;
};
