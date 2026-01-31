const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth.routes');
const googleRoutes = require('./routes/google.routes');
const otpRoutes = require('./routes/otp.routes');
const userRoutes = require('./routes/user.routes');
const materielRoutes = require('./routes/materiel.routes');
const rentalRoutes = require('./routes/rental.routes');
const evaluationRoutes = require('./routes/evaluation.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const errorHandler = require('./middlewares/error.middleware');
const { sessionSecret } = require('./config/env');

const app = express();
app.use(express.json());

app.use(session({ secret: sessionSecret, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleRoutes);
app.use('/api/auth', otpRoutes);
app.use('/api/users', userRoutes);
app.use('/api/materiels', materielRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/favorites', favoriteRoutes);

app.use((req, res) => res.status(404).json({ message: 'Not Found' }));
app.use(errorHandler);

module.exports = app;
