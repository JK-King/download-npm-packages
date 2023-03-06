const jsonfile = require('jsonfile');
const path = require('path');
const fs = require('fs');

const files = fs.readdirSync('packages')
console.log(files.length, 'files', files instanceof Array);
jsonfile.readFile('a.json', (err, data) => {
  console.log(data.length, 'a.json');
  const aa = []
  data.forEach(obj => {
    const fl = aa.filter((val) => val.name === obj.name)
    if (fl.length > 0) {
      console.log(obj.name);
    }else {
      aa.push(obj)
    }
    // const fl = files.filter((val) => val === obj.name)
    // if (fl.length === 0) {
    //   console.log(obj.resolved);
    // }
  });
})