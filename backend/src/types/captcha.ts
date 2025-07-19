export type CaptchaErrorCode =
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

export interface SiteVerifyRes {
	success: boolean
	'error-codes'?: CaptchaErrorCode[]
	challenge_ts?: string
	hostname?: string
}

export interface CaptchaRequestBody {
	'cf-turnstile-response': string;
	[key: string]: any;
}
