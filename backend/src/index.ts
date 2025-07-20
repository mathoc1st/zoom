import express from 'express';
import dotenv from 'dotenv';
import { verifyCaptcha } from './handlers/captcha.js';
import { downloads } from './handlers/downloads.js';
import useragent from 'express-useragent';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = 3000;

// Path to the static website
const staticPath = '../frontend/dist';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(useragent.express());

// Serve static files from 'public' folder
app.use(express.static(staticPath));

const upload = multer();

// Endpoint to verify cloud flare captcha
app.post('/verify-captcha', upload.none(), verifyCaptcha);

// Endpoint to serve zip file downloads
app.get('/download/:filename', downloads);

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});

