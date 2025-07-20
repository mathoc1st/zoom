import { Request, Response } from "express";
import path from "path";
import jwt from 'jsonwebtoken';

export const downloads = (req: Request, res: Response) => {
	const token = req.query.token;

	if (!token || typeof token !== 'string') {
		return res.status(401).send('Missing token');
	}

	try {
		jwt.verify(token, process.env.JWT_SECRET!);
	} catch (err: any) {
		if (err.name === 'TokenExpiredError') {
			return res.status(403).json({ error: 'Token expired' });
		} else if (err.name === 'JsonWebTokenError') {
			return res.status(403).json({ error: 'Token invalid' });
		} else {
			return res.status(403).json({ error: 'Token invalid' });
		}
	}

	const filename = req.params.filename;

	if (!filename.match(/^[a-zA-Z0-9_\-\.]+$/)) {
		return res.status(400).send('Invalid filename');
	}

	if (!req.useragent) {
		return res.status(400).send('Missing useragent');
	}

	const agent = req.useragent

	if (!agent.isDesktop) {
		return res.status(400).send('Invalid platform');
	}
	if (agent.isWindows) {

		const filePath = path.join(process.cwd(), 'files', 'windows', filename);

		res.download(filePath, filename, (err) => {
			if (err) {
				res.status(404).send('File not found');
			}
		})

		return
	}

	if (agent.isMac) {
		let filePath = ''
		const macVer = parseMacOSVersion(req.useragent.source)

		if (macVer == null) {
			return res.status(400).send('Invalid Mac OS version number');
		}

		if (macVer.major >= 15) {
			filePath = path.join(process.cwd(), 'files', 'mac', '15', filename);
		}
		if (macVer.major < 15) {
			filePath = path.join(process.cwd(), 'files', 'mac', 'older', filename);
		}

		return res.download(filePath, filename, (err) => {
			if (err) {
				res.status(404).send('File not found');
			}
		})
	}

	if (agent.isLinux) {
		return res.status(400).send('Linux is not supported');
	}
}

function parseMacOSVersion(userAgent: string) {
	// Match "Mac OS X 10_15_7" or "Mac OS X 11_2" or "Mac OS X 13_4"
	const match = userAgent.match(/Mac OS X (\d+)[_.](\d+)_?(\d+)?/);
	if (!match) return null;

	const major = parseInt(match[1], 10);
	const minor = parseInt(match[2], 10);
	const patch = match[3] ? parseInt(match[3], 10) : 0;

	return { major, minor, patch };
}

