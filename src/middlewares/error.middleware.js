module.exports = (err, req, res, next) => {
  console.error(err);
  if (err && err.isJoi) {
    return res.status(400).json({ message: err.message });
  }
  const status = err.status || 500;
  return res.status(status).json({ message: err.message || 'Internal Server Error' });
};
