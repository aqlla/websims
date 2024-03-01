import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

switch (process.env.ENVIRONMENT) {
    case "development":
        const app = express();
        const port = process.env.PORT || 3000;
        const _filename = fileURLToPath(import.meta.url);
        const _dirname = path.dirname(_filename);
        
        app.use('/dist', express.static(path.join(_dirname, 'dist')));

        app.get('/', (req, res) => {
            res.sendFile(path.join(_dirname, '/index.html'));
        });

        app.listen(port);
}
