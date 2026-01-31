module.exports = {
  googleLogin: (req, res) => {
    return res.json({
      message: 'Redirect to Google login',
      redirectUrl: 'http://localhost:3000/api/auth/google'
    });
  },

  googleCallback: (req, res) => {
    const { user, token } = req.user;
    return res.json({
      message: 'Google authentication successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId
      },
      token
    });
  }
};
