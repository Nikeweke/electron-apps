// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('electron').remote;

function init() {
	// getting current window
	let window = remote.getCurrentWindow()

	// Gathering buttons of menubar
	const minButton     = document.getElementById('min-button')
	const	maxButton     = document.getElementById('max-button')
	const restoreButton = document.getElementById('restore-button')
	const closeButton   = document.getElementById('close-button')

	let isWindowMaximized = false

	// Minimize button 
	minButton.addEventListener("click", event => {
		window.minimize()
	})

	// Close button
	closeButton.addEventListener("click", event => {
		window.close()
	})

	// open on all screen
	maxButton.addEventListener("click", event => {
		window.maximize()
		toggleMaxRestoreButtons()
	})

	// make as it was before
	restoreButton.addEventListener("click", event => {
		window.unmaximize()
		toggleMaxRestoreButtons()
	})

	function toggleMaxRestoreButtons() {
		if (isWindowMaximized) {
			restoreButton.style.display = "none";
			maxButton.style.display     = "flex";

		} else {
			maxButton.style.display     = "none";
			restoreButton.style.display = "flex";
		}
		isWindowMaximized = !isWindowMaximized
	}

	// Toggle maximise/restore buttons when maximisation/unmaximisation
	// occurs by means other than button clicks e.g. double-clicking
	// the title bar:
	// toggleMaxRestoreButtons();
	window.on('maximize', toggleMaxRestoreButtons);
	window.on('unmaximize', toggleMaxRestoreButtons);
}

// Starting init on page complete
(function () {
	// When document has loaded, initialise
	document.onreadystatechange = () => {
		if (document.readyState == "complete") {
			init()
		}
	}
})()
