import crypto from "crypto";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";

export type SocialProvider = "google" | "facebook";

const _socialStates = new Map<string, number>();

interface ProviderConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUrl?: string;
}

const providerConfig = (provider: SocialProvider): ProviderConfig => {
  const envPrefix = provider.toUpperCase();
  return {
    clientId: process.env[`${envPrefix}_CLIENT_ID`],
    clientSecret: process.env[`${envPrefix}_CLIENT_SECRET`],
    redirectUrl: process.env[`${envPrefix}_CALLBACK_URL`],
  };
};

export const getSocialProviders = () => ({
  google: Boolean(providerConfig("google").clientId && providerConfig("google").clientSecret),
  facebook: Boolean(providerConfig("facebook").clientId && providerConfig("facebook").clientSecret),
});

export const buildSocialUrl = (provider: SocialProvider) => {
  const config = providerConfig(provider);
  if (!config.clientId || !config.clientSecret) return null;
  const state = crypto.randomBytes(24).toString("hex");
  _socialStates.set(state, Date.now());
  const redirectUri = config.redirectUrl || `${process.env.CLIENT_URL || "http://localhost:5173"}/api/auth/social/${provider}/callback`;
  const scope = provider === "google" ? "openid email profile" : "email public_profile";
  const url = provider === "google"
    ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(config.clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=select_account&state=${state}`
    : `https://www.facebook.com/dialog/oauth?client_id=${encodeURIComponent(config.clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
  return { url, state };
};

export const validateSocialState = (state: string) => {
  const createdAt = _socialStates.get(state);
  if (!createdAt || Date.now() - createdAt > 10 * 60 * 1000) return false;
  _socialStates.delete(state);
  return true;
};

export const socialUserFromCode = async (provider: SocialProvider, code: string) => {
  const config = providerConfig(provider);
  if (!config.clientId || !config.clientSecret) throw new Error("Social login is not configured.");

  const tokenUrl = provider === "google" ? "https://oauth2.googleapis.com/token" : "https://graph.facebook.com/oauth/access_token";
  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUrl || `${process.env.CLIENT_URL || "http://localhost:5173"}/api/auth/${provider}/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) throw new Error("Social login token exchange failed.");
  const tokenData = await tokenResponse.json() as { access_token?: string; token_type?: string };
  if (!tokenData.access_token) throw new Error("Social login did not return an access token.");

  const profileUrl = provider === "google"
    ? "https://www.googleapis.com/oauth2/v3/userinfo"
    : `https://graph.facebook.com/v2.0/me?fields=id,name,email&access_token=${encodeURIComponent(tokenData.access_token)}`;
  const profileResponse = await fetch(profileUrl, { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
  if (!profileResponse.ok) throw new Error("Social login profile lookup failed.");
  const profile = await profileResponse.json() as { sub?: string; id?: string; name?: string; email?: string };
  const providerId = profile.sub || profile.id;
  const email = profile.email?.toLowerCase();
  if (!providerId || !email || !profile.name) throw new Error("Social account was missing required details.");

  let user = await User.findOne({ $or: [{ email }, { provider: provider, providerId }] });
  if (!user) {
    user = await User.create({
      name: profile.name,
      email,
      phone: "",
      role: "customer",
      provider,
      providerId,
    });
  } else if (!user.providerId) {
    user.provider = provider;
    user.providerId = providerId;
    user.name = user.name || profile.name;
    await user.save();
  }
  return { user, token: generateToken(user._id.toString()) };
};
