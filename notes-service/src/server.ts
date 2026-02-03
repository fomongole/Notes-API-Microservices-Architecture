import { PORT } from "./config/env";
import app from "./app";
import { connectDB } from "./config/db";

const startServer = async () => {
    // 1. Connect to SQL Database
    await connectDB();

    // 2. Start Express App
    app.listen(PORT, () => {
        console.log(`📒 Notes Service (Postgres) running on http://localhost:${PORT}`);
    });
}

startServer();