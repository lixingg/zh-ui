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
copydir.sync(
    process.cwd() + '/types',
    process.cwd() + '/ZHUI/types',
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


