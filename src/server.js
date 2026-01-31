const app = require('./app');
const connectDB = require('./config/database');
const { port } = require('./config/env');

const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
