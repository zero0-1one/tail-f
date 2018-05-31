# tail-f
watch file like tail -f

#Installation
npm install --save zo-tail-f

#Usage
const tail = require('zo-tail-f')

let watcher = tail.watch('test/test.log')
watcher.on('line', line => {
  console.log('line: ' + line)
})

#tail.watch
-filename <string> which file was watch on
-options <Object>  

#Options
-encoding <string>  default:'utf8'
-mode <string>      default:'line'  
--line  
--chunk
--stream