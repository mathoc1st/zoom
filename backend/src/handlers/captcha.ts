import { Request, Response } from "express";
import { CaptchaRequestBody, SiteVerifyRes } from "../types/captcha"
import jwt from 'jsonwebtoken';

export const verifyCaptcha = async (req: Request, res: Response) => {
	const body = req.body as CaptchaRequestBody;
	const token = body["cf-turnstile-response"];
	const ip = req.headers['cf-connecting-ip'];

	if (!token) {
		return res.status(400).json({ success: false, error: 'Missing CAPTCHA token' });
	}

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
			const downloadToken = jwt.sign(
				{ passedCaptcha: true },
				process.env.JWT_SECRET!,
				{ expiresIn: '5m' }
			);

			res.json({ success: true, token: downloadToken });
		} else {
			res.status(400).json({ success: false, errors: data['error-codes'] });
		}
	} catch (err) {
		res.status(500).json({ success: false, error: 'Captcha verification failed' });
	}
};

