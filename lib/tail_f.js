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
    this.lastLine = '' // Only valid if mode is 'line'
    this.init()
  }

  init() {
    if (this.watcher) {
      this.close()
    }
    this.watcher = fs.watch(this.filename, this.options['encoding'])

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

    this.analyseEnd(fs.statSync(this.filename))
  }

  analyse() {
    if (this.inspect) {
      clearTimeout(this.inspect)
      this.inspect = undefined
    }
    this.analysing = true
    this.changed = false
    fs.stat(this.filename, (err, stat) => {
      if (this.previous.size < stat.size) {
        let stream = fs.createReadStream(this.filename, {
          encoding: this.options['encoding'],
          start: this.previous.size,
          end: stat.size - 1
        })

        if (this.options['mode'] == 'line') {
          stream.on('data', chunk => {
            let lines = chunk.toString().split('\n')
            let index = 0
            if (this.lastLine === null && lines[0] === '') {
              index = 1
            } else {
              lines[0] = this.lastLine + lines[0]
            }
            this.lastLine = lines.pop()
            while (index < lines.length) {
              this.emit('line', lines[index++])
            }
          })
        } else if (this.options['mode'] == 'chunk') {
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
        if (this.lastLine) {
          this.emit('line', this.lastLine)
          this.lastLine = null
        }
        this.analyseEnd(stat)
      }
    })
  }

  analyseEnd(stat) {
    this.previous = stat
    this.analysing = false
    if (this.changed) {
      this.analyse()
    } else if (this.options['interval'] || this.lastLine) {
      this.inspect = setTimeout(() => {
        this.inspect = undefined
        this.analyse()
      }, this.options['interval'] || 100)
    }
  }

  close() {
    if (this.inspect) {
      clearTimeout(this.inspect)
      this.inspect = undefined
    }
    this.watcher.close()
    this.watcher = undefined
  }
}

module.exports = {
  watch(filename, options = {}) {
    let defOptions = {
      'encoding': 'utf8',
      'mode': 'line', // 'chunk', 'stream'

      //Sometimes fs.watch() is delayed too much, For more timely changes, you can set the 'interval' parameter
      //ms   0: no inspect
      'interval': 0
    }
    return new TailWatch(filename, Object.assign(defOptions, options))
  }
}