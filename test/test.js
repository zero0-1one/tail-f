'use strict'

const fs = require('fs')
const tail = require('..')



let tailLine = tail.watch('test/test.log', {
  'interval': 100
})
let tailChunk = tail.watch('test/test.log', {
  'mode': 'chunk',
})

let lineCount = 0
tailLine.on('line', line => {
  lineCount++
  console.log(`line ${lineCount}: ${line}`)
})

tailChunk.on('chunk', chunk => {
  console.log('chunk: ' + chunk)
})


let times = 0
let id = setInterval((e) => {
  if(times++ == 50){
    clearInterval(id)
    console.log('Test Finished ')
    tailLine.close()
    tailChunk.close()
    if(lineCount != 50){ 
      throw new Error('The number of lines is wrong')
    }
    return
  }
  fs.appendFileSync('test/test.log', new Date().valueOf()+'\n' , 'utf8')
}, 200)