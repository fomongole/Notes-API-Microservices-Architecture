import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
// import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import userRoutes from './routes/user.routes';
import internalRoutes from './routes/internal.routes';
import { errorHandler, notFound } from "./middlewares/error.middleware";
import { CLIENT_URL } from "./config/env";
import { apiLimiter } from "./middlewares/rateLimit.middleware";

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10kb' }));
// app.use(mongoSanitize());
// app.use(hpp());

// 1. PUBLIC/PROTECTED ROUTES (For Users/Admin)
// Accessible via Gateway or direct port 3002
app.use('/users', apiLimiter, userRoutes);

// 2. INTERNAL ROUTES (For Auth Service)
// Not exposed to public Gateway
app.use('/internal', internalRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).send('User Service is UP 👤');
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;