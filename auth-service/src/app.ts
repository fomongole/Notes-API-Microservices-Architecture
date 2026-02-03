import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import internalRoutes from './routes/internal.routes';
// import hpp from 'hpp';
// import mongoSanitize from 'express-mongo-sanitize';

import authRoutes from './routes/auth.routes';
import { errorHandler, notFound } from "./middlewares/error.middleware";
import { CLIENT_URL } from "./config/env";
import { apiLimiter } from "./middlewares/rateLimit.middleware";

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use('/auth', apiLimiter);
app.use(express.json({ limit: '10kb' }));
// app.use(mongoSanitize());
// app.use(hpp());

//routes
app.use('/auth', authRoutes);
app.use('/internal', internalRoutes);

app.get('/health', (req, res) => {
    res.status(200).send('Auth Service is UP 🔐');
});

app.use(notFound);
app.use(errorHandler);

export default app;