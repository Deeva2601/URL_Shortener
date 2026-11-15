import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { connectDB } from './config/db.js';
import { createUrlController } from './controllers/urlController.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createUrlRoutes } from './routes/urlRoutes.js';

const app = express();
const port = Number(process.env.PORT) || 5000;
const baseUrl = process.env.BASE_URL?.replace(/\/+$/, '');
const clientOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

if (!baseUrl) {
  throw new Error('BASE_URL is required (for example, https://your-api.onrender.com).');
}

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(cors({
  origin(origin, callback) {
    if (!origin || clientOrigins.includes(origin.replace(/\/+$/, ''))) {
      return callback(null, true);
    }
    const error = new Error('Origin is not allowed by CORS.');
    error.status = 403;
    return callback(error);
  }
}));
app.use(express.json({ limit: '16kb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/urls', createUrlRoutes(createUrlController(baseUrl)));
app.get('/:shortCode', (req, res, next) => {
  if (req.params.shortCode === 'health' || req.params.shortCode === 'api') {
    return next();
  }
  return createUrlController(baseUrl).redirect(req, res, next);
});
app.use(notFoundHandler);
app.use(errorHandler);

try {
  await connectDB(process.env.MONGO_URI);
  app.listen(port, () => console.info(`Shortlink API listening on port ${port}.`));
} catch (error) {
  console.error('Server startup failed:', error);
  process.exitCode = 1;
}
