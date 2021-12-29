const electronDialog = require('electron').remote.dialog;
const { copyFile } = require('./copy-file')
const EventEmitter = require('events')

require('./window') // window functionality

// https://jaketrent.com/post/select-directory-in-electron/
const eventEmitter = new EventEmitter();
const DEFAULT_ITEM = {
	filename: '',
	from: '',
	to: '',
	progress: 0
}
// if unix its must be forward slashes 
const DELIMETR = process.platform === 'win32' ? `\\` : '/'

new Vue({
	el: '#main',

	data: () => ({
		stack: [],
		item: {...DEFAULT_ITEM},
		isTransfering: false,
	}),

	methods: {
		pickFile(side) {
			const dialogProp = {
				properties: [side === 'from' ? 'openFile' : 'openDirectory']
			}
			
			electronDialog.showOpenDialog(dialogProp).then((path) => {
				if (side === 'from') {
					const exploadedPath = path.filePaths[0].split(DELIMETR)
					this.item.filename = exploadedPath[exploadedPath.length-1]
					this.item.to   = path.filePaths[0]
					this.item.from = path.filePaths[0] 

				} else {
					this.item[side] = path.filePaths[0] + DELIMETR + this.item.filename  
					this.addToStack()
					return
				}
			})
		},

		addToStack() {
			const {to, from} = this
			if (to === '' || from === '') return
			this.stack.push(this.item)
			this.item = {...DEFAULT_ITEM}
		},

		clearStack() {
			this.stack = []
			this.stopTransfering()
		},

		stopTransfering() {
			this.isTransfering = false
			eventEmitter.emit('stop-transfering')
		},

		startTransfering() {
			if (this.stack.length === 0) {
				alert('Tasks is empty')
				return
			}

			this.isTransfering = true

      // making progress procents grows
			eventEmitter.on('progress', ({index, percentage}) => {
				this.stack[index].progress = percentage
			});
			
			// making waterfall
			const reducer = (accumulator, currentValue, index) => {
				if (currentValue.progress == 100) return accumulator
				return accumulator.then(() => copyFile({ index, ...currentValue, eventEmitter}))  
			}
			
			this.stack.reduce(reducer, Promise.resolve()).then(() => {
				this.isTransfering = false
			})
		}

	},

})

