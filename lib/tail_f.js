'use strict'

const fs = require('fs')
const EventEmitter = require('events')

class TailWatch extends EventEmitter {
  constructor(filename, options) {
    super()
    this.options = options
    this.filename = filename
    this.analysing = false
    this.changed = false
    this.init()
  }

  init() {
    if (this.watcher) {
      this.close()
    }
    this.previous = fs.statSync(this.filename)
    this.watcher = fs.watch(this.filename, this.options.encoding)

    this.watcher.on('change', (eventType, filename) => {
      if (eventType == 'change') {
        if (this.analysing) {
          this.changed = true
        } else {
          this.analyse()
        }
      }
    })

    this.watcher.on('error', err => {
      process.nextTick(this.init())
    })
  }

  analyse() {
    this.analysing = true
    this.changed = false
    fs.stat(this.filename, (err, stat) => {
      if (this.previous.size < stat.size) {
        let stream = fs.createReadStream(this.filename, {
          encoding: this.options.encoding,
          start: this.previous.size,
          end: stat.size
        })

        if (this.options.mode == 'line') {
          stream.on('data', chunk => {
            let lines = chunk.toString().trim().split('\n')
            for (let line of lines) {
              this.emit('line', line)
            }
          })
        } else if (this.options.mode == 'chunk') {
          stream.on('data', chunk => {
            this.emit('chunk', chunk)
          })
        } else {
          this.emit('stream', stream)
        }

        stream.on('end', () => {
          this.analyseEnd(stat)
        })
      } else {
        this.analyseEnd(stat)
      }
    })
  }

  analyseEnd(stat) {
    this.previous = stat
    this.analysing = false
    if (this.changed) {
      this.analyse()
    }
  }

  close() {
    this.watcher.close()
    this.watcher = undefined
  }
}

module.exports = {
  watch(filename, options = {}) {
    let defOptions = {
      encoding: 'utf8',
      mode: 'line' // 'chunk', 'stream'
    }
    return new TailWatch(filename, Object.assign(defOptions, options))
  }
}