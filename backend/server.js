// =================================================================
// BhoomiChain – server.js  (Express entry point)
// Sets up: CORS, JSON body parser, auth + land routes, global
// error handler, and Mongoose connection.
// =================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Import route handlers
const authRoutes = require('./routes/authRoutes');
const landRoutes = require('./routes/landRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

// ---- Global Middleware ----------------------------------------
app.use(cors({
    origin: process.env.https://bhoomi-chain.vercel.app/ || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (combined in prod, dev format in development)
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ---- Health check --------------------------------------------
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'BhoomiChain API', timestamp: new Date().toISOString() });
});

// ---- API Routes ----------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/land', landRoutes);

// ---- 404 Handler ---------------------------------------------
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ---- Global Error Handler ------------------------------------
// Express recognises this as an error handler because it has 4 params
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.error('[ERROR]', err.message);
    console.error(err.stack);
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// ---- Start ---------------------------------------------------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🌿 BhoomiChain backend running on http://localhost:${PORT}`);
        console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    });
}).catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
});

module.exports = app; // export for testing
