# tail-f
watch file like tail -f

# Installation
```sh
  npm install --save zo-tail-f
```

# Usage
```js
  const tail = require('zo-tail-f')  
  let watcher = tail.watch('test/test.log')
  watcher.on('line', line => {
    console.log(line)
  }) 
```

# api
## tail.watch(filename, options)
- `filename`: 
- `options`: 
  - `encoding`:   default: 'utf8'
  - `mode`:   'line' 'chunk' 'stream',   default:'line'  
  - `interval`: ms,  default: 0 no inspect. Sometimes fs.watch() is delayed too much, For more timely changes, you can set the 'interval' parameter