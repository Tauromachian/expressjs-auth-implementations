import { Router } from "express";

import { OAuth2Client } from "google-auth-library";
import { makeState, validateState } from "../utils/oauth-state.mjs";

export const googleRouter = Router();

const { APP_URL, GOOGLE_ID, GOOGLE_SECRET, GOOGLE_STATE_SECRET } = process.env;

const REDIRECT_URI = `${APP_URL}auth/google/callback`;

const googleClient = new OAuth2Client({
  clientId: GOOGLE_ID,
  clientSecret: GOOGLE_SECRET,
  redirectUri: REDIRECT_URI,
});

googleRouter.get("/login", (_, res) => {
  const params = new URLSearchParams({
    client_id: GOOGLE_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
    state: makeState(GOOGLE_STATE_SECRET),
  });

  const GOOGLE_URL = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return res.redirect(GOOGLE_URL);
});

googleRouter.get("/callback", async (req, res, next) => {
  const { code, state } = req.query;

  if (!code || !state) return next(new Error("Missing Google credential"));

  const isValid = validateState(state, GOOGLE_STATE_SECRET);

  if (!isValid) return next(new Error("Invalid state"));

  const { tokens } = await googleClient.getToken(String(code));

  if (!tokens.id_token) throw new Error("Error with Google Login`");

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: GOOGLE_ID,
  });

  const payload = ticket.getPayload();

  console.log("Logged in successfully");
  console.log(payload);

  return res.redirect(APP_URL);
});
