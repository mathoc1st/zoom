import express from 'express';
import dotenv from 'dotenv';
import { verifyCaptcha } from './handlers/captcha.js';
import { downloads } from './handlers/downloads.js';
import useragent from 'express-useragent';
import multer from 'multer';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

const staticPath =  path.join(process.cwd(), '../frontend/dist');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(useragent.express());

// Serve static files from 'public' folder
app.use(express.static(staticPath));

app.get('/schedule/89065232570', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

const upload = multer(); // no storage needed if you're not uploading files

// Endpoint to verify cloud flare captcha
app.post('/verify-captcha', upload.none(), verifyCaptcha);

// Endpoint to serve zip file downloads
app.get('/download/:filename', downloads);

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});

