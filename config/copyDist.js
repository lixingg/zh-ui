let copydir = require('copy-dir')
copydir.sync(
  process.cwd() + '/dist',
  process.cwd() + '/ZHUI/dist',
  {
    utimes: true,
    mode: true,
    cover: true
  },
  function (err) {
    if (err) throw err
    console.log('done')
  }
)


