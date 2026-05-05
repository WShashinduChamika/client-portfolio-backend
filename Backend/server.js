import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import serverless from 'serverless-http';
import { connectDB, disconnectDB } from './config/db-config.js';
import { userRoutes } from './routes/user-routes.js';
import { blogRoutes } from './routes/blog-routes.js';
import { UPLOAD_ROOT } from './utils/upload-path.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;
const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || '')
  .split(/[;,|]/)
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
}

// Middleware
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files as static assets
app.use('/uploads', express.static(UPLOAD_ROOT));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Portfolio Backend API',
    status: 'Server is running successfully'
  });
});


// API Routes
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

// Start server only when run directly (local dev); export handler for serverless
let server;
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Local: http://localhost:${PORT}`);
  });
}

const handler = serverless(app);
export default handler;

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (server) {
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  if (server) {
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
});
