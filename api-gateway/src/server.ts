import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { PORT, AUTH_SERVICE_URL, USER_SERVICE_URL, NOTES_SERVICE_URL, CLIENT_URL } from './config/env';
import { errorHandler, notFound } from "./middlewares/error.middleware";

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: CLIENT_URL, credentials: true }));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'API Gateway' });
});

// -------------------------------------------------------
// PROXY RULES
// -------------------------------------------------------

// 1. Auth: Incoming '/api/auth/register' -> Express strips '/api/auth' -> Proxy sees '/register'
//    Rewrite adds '/auth' back -> Final: 'http://localhost:3001/auth/register'
app.use('/api/auth', createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/': '/auth/',
    },
}));

// 2. User: Incoming '/api/users/me' -> Express strips '/api/users' -> Proxy sees '/me'
//    Rewrite adds '/users' back -> Final: 'http://localhost:3002/users/me'
//    (Note: This matches your User Service app.use('/users', ...) setup)
app.use('/api/users', createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/': '/users/',
    },
}));

// 3. Notes: Incoming '/api/notes' -> Express strips '/api/notes' -> Proxy sees '/'
//    Rewrite adds '/notes' back -> Final: 'http://localhost:3003/notes/'
app.use('/api/notes', createProxyMiddleware({
    target: NOTES_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/': '/notes/',
    },
}));

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
    console.log(`👉 Auth Proxy: ${AUTH_SERVICE_URL}`);
    console.log(`👉 User Proxy: ${USER_SERVICE_URL}`);
    console.log(`👉 Notes Proxy: ${NOTES_SERVICE_URL}`);
});