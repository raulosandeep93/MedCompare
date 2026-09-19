import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Mount API routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Medicine Aggregator API (India)',
    platforms: ['Apollo Pharmacy', 'Truemeds', 'PlatinumRx'],
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Medicine Aggregator Server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   - GET  /api/search?q=dolo+650&pincode=560001`);
  console.log(`   - GET  /api/pincode/lookup?pincode=560001`);
  console.log(`   - POST /api/scan-strip`);
  console.log(`   - GET  /api/popular-medicines`);
});
