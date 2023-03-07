const download = require('download');
const jsonfile = require('jsonfile');
const path = require('path');
const fs = require('fs');
const ora = require('ora')
const command = require('./command');
const packagesPath = path.resolve(__dirname, 'packages');
const packagesTypesPath = path.resolve(__dirname, 'packages\\types');
const argv = process.argv;
const pathIdx = argv.findIndex((val, idx) => {
  if (val === command.PATH) {
    return idx;
  }
})
let filePath = path.resolve(__dirname, 'package-lock.json');
(function () {
  if (pathIdx !== -1 && pathIdx < argv.length - 1) {
    filePath = argv[pathIdx + 1]
  }
})();
console.log(filePath)
jsonfile.readFile(filePath, async function (err, jsonData) {
  if (!err) {
    const spinner = ora('download packages')
    spinner.start() //显示加载状态  
    // 存储npm包
    const resolvedUrl = [];
    // 存储types包
    const typesUrl = [];
    const loopDependencies = (dependenciesData) => {
      const dependencies = dependenciesData.dependencies || {};
      Object.keys(dependencies).forEach(function (key) {
        if (key) {
          const dependencie = dependencies[key]
          const resolved = dependencie.resolved
          const name = resolved.split('/').pop()
          const find = resolvedUrl.find((obj) => obj.resolved === resolved)
          const findTypes = typesUrl.find((obj) => obj.resolved === resolved)
          if (!find && !findTypes) {
            if (!key.includes('@types')) {
              resolvedUrl.push({
                name,
                resolved,
              })
            } else {
              typesUrl.push({
                name,
                resolved,
              })
            }
          }
          loopDependencies(dependencie)
        }
      })
    }
    loopDependencies(jsonData)
    console.log(`\n总共${resolvedUrl.length}+${typesUrl.length}个依赖`);
    if (!fs.existsSync(packagesPath)) {
      fs.mkdirSync(packagesPath);
    }
    if (!fs.existsSync(packagesTypesPath)) {
      fs.mkdirSync(packagesTypesPath);
    }
    const downfiles = fs.readdirSync(packagesPath) || []
    const downtypefiles = fs.readdirSync(packagesTypesPath) || []
    const finishTotal = [];
    let isFinish1 = false
    let isFinish2 = false
    if (resolvedUrl.length === 0) {
      isFinish1 = true
    }
    resolvedUrl.forEach(async (obj, idx) => {
      const filepath = obj.resolved
      const findIdx = downfiles.findIndex((val) => filepath.split('/').pop() === val)
      // console.log(findIdx)
      if (findIdx === -1) {
        await download(obj.resolved, packagesPath);
      }
      finishTotal.push(idx);
      // console.log(finishTotal.length, 'finishTotal');
      if (finishTotal.length === resolvedUrl.length) {
        // console.log('完成所有下载');
        isFinish1 = true
      }
    })
    const finishTypesTotal = [];
    if (typesUrl.length === 0) {
      isFinish2 = true
    }
    typesUrl.forEach(async (obj, idx) => {
      const filepath = obj.resolved
      const findIdx = downtypefiles.findIndex((val) => filepath.split('/').pop() === val)
      // console.log(findIdx)
      if (findIdx === -1) {
        await download(obj.resolved, packagesTypesPath);
      }
      finishTypesTotal.push(idx);
      // console.log(finishTypesTotal.length, 'finishTypesTotal');
      if (finishTypesTotal.length === typesUrl.length) {
        // console.log('完成所有Types包下载');
        isFinish2 = true
      }
    });
    if (isFinish1 && isFinish2) {
      console.log('完成所有下载');
      spinner.stop() //隐藏加载状态
    }
  }
});