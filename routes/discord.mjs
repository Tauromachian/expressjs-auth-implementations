import { Router } from "express";
import { makeState, validateState } from "../utils/oauth-state.mjs";

export const discordRouter = Router();

const { APP_URL, DISCORD_ID, DISCORD_SECRET, DISCORD_STATE_SECRET } =
  process.env;

const DISCORD_REDIRECT_URI = `${APP_URL}auth/discord/callback`;
const REDIRECT_URI = `${APP_URL}auth/discord/callback`;

discordRouter.get("/login", (_, res) => {
  const params = new URLSearchParams({
    client_id: DISCORD_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "identify+email",
    state: makeState(DISCORD_STATE_SECRET),
  });

  const URL = `https://discord.com/oauth2/authorize?${params.toString()}`;

  res.redirect(URL);
});

export async function discordCallback(req, _, next) {
  const { code, state } = req.query;

  if (!code) return next(new Error("Missing Discord credential"));

  const isValid = validateState(state, DISCORD_STATE_SECRET);
  if (!isValid) return next(new Error("Invalid state"));

  const DISCORD_URI = "https://discord.com/api/";
  const TOKEN_URL = `${DISCORD_URI}v10/oauth2/token`;
  const USER_API_URL = `${DISCORD_URI}users/@me`;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${DISCORD_ID}:${DISCORD_SECRET}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
    }),
  });

  const { access_token } = response.data;

  const userResponse = await fetch(USER_API_URL, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const payload = userResponse.data;

  console.log("Logged in successfully");
  console.log(payload);

  return res.json({ message: "Login successful" });
}
