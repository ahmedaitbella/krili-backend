const authService = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../validations/auth.validation');

async function register(req, res, next) {
  try {
    await registerSchema.validateAsync(req.body);
    const { user, token } = await authService.register(req.body);
    return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    await loginSchema.validateAsync(req.body);
    const { user, token } = await authService.login(req.body);
    return res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
