import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import { allowedClientOrigins } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: allowedClientOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
const uploadDir = path.resolve(__dirname, '../upload');
app.use('/uploads', express.static(uploadDir));

// API routes
app.use('/api', routes);

// 404 Not Found handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint không tồn tại trên hệ thống',
  });
});

// Centralized error handler
app.use(errorMiddleware);

export default app;

