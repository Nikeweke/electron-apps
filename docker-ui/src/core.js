require('v8-compile-cache');
require('./window') // window functionality

// set semantic version
const pjson = require('../package.json');
const version = pjson.version
const versionSpan = document.getElementById('version')
versionSpan.innerHTML = version

const { exec } = require('child_process');
const dockerode = require('dockerode');
const electronDialog = require('electron').remote.dialog;
// if unix its must be forward slashes 
// const DELIMETR = process.platform === 'win32' ? `\\` : '/'
//

const dirname = __dirname

new Vue({
	el: '#main',

	data: () => ({
		dockerHost: 'http://192.168.99.100',
		dockerode: {},
		dockerActive: false,
		command: '',
		output: [],
		containers: [],
		images: [],
		cwd: dirname,
		showContainers: true,
		showConsole: true,
	}),

	watch: {
    output() {
			this.scrollBottomConsole()
		},

		showContainers(value) {
      if (value) {
        this.dockerPs()
			} else {
				this.dockerImages()
			}
		}
	},

	filters: {
    bytesToSize(bytes) {
			var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
			if (bytes == 0) return '0 Byte';
			var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
			return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	 	}
	},

	methods: {
		scrollBottomConsole() {
			var area = document.querySelector('#console-area');
			area.scrollTop = area.scrollHeight
		},

		initApp() {
      const host = this.dockerHost
			this.dockerode = new dockerode({ host });

			this.output.push('> Checking docker status...')
			this.dockerode.ping()
			.then(() => {
				this.output.push('active', '&nbsp;')
				this.dockerActive = true

				this.dockerPs(false)
				this.dockerImages(false)
			})
			.catch((err) => { 
				this.output.push(JSON.stringify(err)) 
			})

		},

	  dockerPs() {
			this.output = []
			this.dockerode.listContainers({all: true}, (err, containers) => {
				this.containers = containers
				this.output.push('> docker ps -a')
				this.output.push('Containers amount = ' + containers.length, '&nbsp;')
				this.scrollBottomConsole()
			});
		},

		dockerImages() {
			this.output = []
			this.dockerode.listImages((err, images) => {
				this.images = images
				this.output.push('> docker images')
				this.output.push('Images amount = ' + images.length, '&nbsp;')
			});
		},

		rmAllImages() {
			this.output = []
			this.output.push('> docker rmi $(sudo docker images -q)')
      this.dockerode.listImages((err, images) => {
				if (images.length === 0) return this.output.push('No images found', ' ')
				for (let image of images) {
					const dImage = this.dockerode.getImage(image.Id)
					dImage.remove({force: true}, (err, res) => {
						console.log('image remove', res)
						this.output.push(JSON.stringify(res))
					})  
				}
			});
		},

		rmAllContainers() {
			this.output = []
			this.output.push('> docker rm $(sudo docker ps -q -a)')
			this.dockerode.listContainers({all: true}, (err, containers) => {
				if (containers.length === 0) return this.output.push('No containers found', ' ')

				for (let image of containers) {
					const dContainer = this.dockerode.getContainer(image.Id)
					dContainer.remove({force: true}, (err, res) => {
						console.log('container remove', res)
						this.output.push(JSON.stringify(res))
					})  
				}

				this.dockerPs()
			});
		},

		systemPrune() {
			this.output = []
			this.rmAllContainers()
			this.rmAllImages()

			this.dockerode.pruneVolumes((err, res) => {
				this.output.push('Volumes - ' + JSON.stringify(res))
			})
			this.dockerode.pruneNetworks((err, res) => {
				this.output.push('Networks - ' + JSON.stringify(res))
			})
		},

		portFormat(value) {
			// let val = JSON.parse(JSON.stringify(value)).reverse()
			let result = ''
			for (let item of value) {
        result += `${item.IP}:${item.PrivatePort}${item.PublicPort ? '->' + item.PublicPort  : '' }/${item.Type} <br>` 
			}
			return result
		},

		selectFolder() {
			electronDialog.showOpenDialog({
				properties: ['openDirectory']
			})
			.then((path) => {
				this.cwd = path.filePaths[0]
			})
		},

		dockerComposePs() {
			this.execCommand('docker-compose ps')
		},

		dockerComposeUp() {
			this.execCommand('docker-compose up --build')
		},

		dockerComposeDown() {
			this.execCommand('docker-compose down')
		},

		execCommand(cmd) {
			console.log(cmd)
			let { cwd } = this
			this.output.push(`${cwd}> ${cmd}`)
			exec(cmd, { cwd }, (err, stdout, stderr) => {
				if (err) {
					// node couldn't execute the command
					console.log('Error of exec', err)
					return;
				}

				console.log(stdout)
				console.log(stderr)

				this.output.push(stdout.replace(/(\r\n|\n|\r)/gm, "<br>"), '&nbsp;');
			});
		}
	},

	created() {
		this.initApp()
	},

})

