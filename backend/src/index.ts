import express from 'express';
import path from 'path';
import fetch from 'node-fetch'; // or built-in fetch in newer Node.js
import dotenv from 'dotenv';

interface CaptchaRequestBody {
	'cf-turnstile-response': string;
	[key: string]: any;
}

type CaptchaErrorCode =
	| 'missing-input-secret'
	| 'invalid-input-secret'
	| 'missing-input-response'
	| 'invalid-input-response'
	| 'bad-request'
	| 'timeout-or-duplicate'
	| 'internal-error'
	| 'invalid-json'
	| 'invalid-origin'
	| 'unreachable'
	| 'unknown-error';

interface SiteVerifyRes {
	success: boolean
	'error-codes'?: CaptchaErrorCode[]
	challenge_ts?: string
	hostname?: string
}

dotenv.config();

const app = express();
const PORT = 3000;

const staticPath = path.join(__dirname, '../frontend/dist');

// Middleware to parse JSON bodies (for captcha verification requests)
app.use(express.json());

// Serve static files from 'public' folder
app.use(express.static(staticPath));

//app.get('/', (req, res) => {
//res.sendFile(path.join(__dirname, 'public', 'index.html'));
//});

app.post('/verify-captcha', async (req, res) => {
	const body = req.body as CaptchaRequestBody;
	const token = body['cf-turnstile-response'];
	const ip = req.headers['cf-connecting-ip'];

	const secret = process.env.TURNSTILE_SECRET;
	const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

	const params = new URLSearchParams();
	params.append('secret', secret!);
	params.append('response', token);

	if (ip && !Array.isArray(ip) && ip != '') {
		params.append('remoteip', ip);
	}

	try {
		const response = await fetch(verifyUrl, {
			method: 'POST',
			body: params
		});
		const data = await response.json() as SiteVerifyRes;

		if (data.success) {
			res.json({ success: true });
		} else {
			res.status(400).json({ success: false, errors: data['error-codes'] });
		}
	} catch (err) {
		res.status(500).json({ success: false, error: 'Captcha verification failed' });
	}
});

// Endpoint to serve zip file downloads
app.get('/download/:filename', (req, res) => {
	const filename = req.params.filename;
	// Simple validation to prevent directory traversal
	if (!filename.match(/^[a-zA-Z0-9_\-\.]+$/)) {
		return res.status(400).send('Invalid filename');
	}

	const filePath = path.join(process.cwd(), 'files', filename);
	res.download(filePath, filename, (err) => {
		if (err) {
			res.status(404).send('File not found');
		}
	});
});

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});

