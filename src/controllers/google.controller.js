import { frontendUrl } from "../config/env.js";

export default {
  googleLogin: (req, res) => {
    return res.json({
      message: "Redirect to Google login",
      redirectUrl: "/api/auth/google",
    });
  },

  googleCallback: (req, res) => {
    const { token, isNewUser } = req.user;
    // Redirect to the frontend callback page with the JWT as a query param.
    // For brand-new Google users, pass setup=1 so the frontend redirects them
    // to the role-selection page (they default to "tenant" but can change it).
    const setupParam = isNewUser ? "&setup=1" : "";
    return res.redirect(
      `${frontendUrl}/auth/google/callback?token=${token}${setupParam}`,
    );
  },
};
