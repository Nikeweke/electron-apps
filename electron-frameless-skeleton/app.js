const { app, BrowserWindow } = require('electron')

let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    // icon: path.join(__dirname, 'assets/logo/64x64.png'),
    width: 800, 
    height: 900,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('./src/index.html')

  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)



// ==============================================> MacOS stuff
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})
