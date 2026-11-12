import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

app.use(express.json());
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

