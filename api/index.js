const app = require('../src/app');
const connectDB = require('../src/config/database');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database connection error' });
    }
  }

  return app(req, res);
};
