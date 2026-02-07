import { Router } from "express";

export const steamRouter = Router();

const { APP_URL, STEAM_API_KEY } = process.env;

const REDIRECT_URL = `${APP_URL}auth/steam/return`;

steamRouter.get("/login", (_, res) => {
  const openidParams = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": REDIRECT_URL,
    "openid.realm": APP_URL,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  const STEAM_URL = `https://steamcommunity.com/openid/login?${openidParams.toString()}`;

  res.redirect(STEAM_URL);
});

steamRouter.get("/callback", async (req) => {
  const params = req.query;

  const verificationParams = new URLSearchParams({
    ...params,
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "check_authentication",
  });

  const STEAM_URL = "https://steamcommunity.com/openid/login";

  const loginResponse = await fetch(STEAM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: verificationParams.toString(),
  });

  const loginData = await loginResponse.json();
  if (!loginData.includes("is_valid:true")) {
    throw new Error("Error getting Steam tokens");
  }

  const claimedId = params["openid.claimed_id"];
  const steamId = claimedId.match(/\d+$/)[0];

  const STEAM_PLAYER_URL =
    "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/";

  const url = new URL(STEAM_PLAYER_URL);
  url.searchParams.append("key", STEAM_API_KEY);
  url.searchParams.append("steamids", steamId);

  const response = await fetch(STEAM_PLAYER_URL);

  const { data } = await response.json();

  console.log(data);
  console.log("You are logged in");
});
