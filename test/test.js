'use strict'

const fs = require('fs')
const tail = require('..')

setInterval(() => {
  fs.appendFileSync('test/test.log', new Date().toLocaleString() + '\n', 'utf8')
}, 200)


let tailLine = tail.watch('test/test.log')
let tailChunk = tail.watch('test/test.log', {
  mode: 'chunk'
})

tailLine.on('line', line => {
  console.log('line: ' + line)
})

tailChunk.on('chunk', chunk => {
  console.log('chunk: ' + chunk)
})