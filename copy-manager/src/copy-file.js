
const progress = require('progress-stream');
const fs       = require('fs')
const ncp      = require('ncp').ncp;
const getFolderSize      = require('get-folder-size');

module.exports = {
  copyFile
}

function copyFile ({index, from: fromPath, to: toPath, eventEmitter}) {

  const fn = async (res) => {
    const fileSize = await getFilesizeInBytes(fromPath)
    const str = progress({ time: 100 });

    // wathc for progress and show progress bar in console
    str.on('progress', (progress) => {
      const percentage = ((progress.transferred*100) / fileSize).toFixed(0)
      eventEmitter.emit('progress', {index, percentage})
    });

    // attaching to read and write stream
    const options = {
      transform(readStream, writeStream) {
        readStream.pipe(str).pipe(writeStream)

        // when stop-transfering - stop process  
        eventEmitter.on('stop-transfering', () => {
          readStream.destroy()
          writeStream.destroy()
        })

        // after each write stream closed - make process exit via Promise
        writeStream.on('close', () => res('success'))
      }
    }

    // copy process
    ncp(fromPath, toPath, options, function (err) {
      if (err) {
        return console.error(err);
      }
    });
  }

  return new Promise(fn).catch(err => { console.log(err); alert(err) })
}

function getFilesizeInBytes(filename) {
  return new Promise((res) => {
    const stats = fs.statSync(filename)
  
    if (stats.isDirectory()) {
      getFolderSize(filename, (err, size) => {
        if (err) { console.log(err); }
        res(size)
      });

    } else if(stats.isFile()) {
      res(stats["size"])
    }
  })
}

