'use strict'

const fs = require('fs')
const tail = require('..')

let times = 0
let id = setInterval((e) => {
  if(times++ == 50){
    clearInterval(id)
    console.log('Test Finished ')
    return
  }
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