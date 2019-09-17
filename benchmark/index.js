'use strict'

var path = require('path')
var fork = require('child_process').fork
var CLI = require('../lib/benchmark-cli')

var cli = CLI(`usage: node benchmark [options] [--] <category> ...
  Run each benchmark in the <category> directory a single time, more than one
  <category> directory can be specified.
  --filter pattern          string to filter benchmark scripts
  --set    variable=value   set benchmark variable (can be repeated)
  --format [simple|csv]     optional value that specifies the output format
`, { arrayArgs: ['set'] })
var benchmarks = cli.benchmarks()

if (benchmarks.length === 0) {
  console.error('No benchmarks found')
  // eslint-disable-next-line
  process.exit(1);
}

var validFormats = ['csv', 'simple']
var format = cli.optional.format || 'simple'
if (validFormats.indexOf(format) === -1) {
  console.error('Invalid format detected')
  process.exit(1)
}

if (format === 'csv') {
  console.log('"filename", "configuration", "rate", "time"')
}

(function recursive (i) {
  var filename = benchmarks[i]
  var child = fork(path.resolve(__dirname, filename), cli.optional.set)

  if (format !== 'csv') {
    console.log()
    console.log(filename)
  }

  child.on('message', function (data) {
    if (data.type !== 'report') {
      return
    }
    // Construct configuration string, " A=a, B=b, ..."
    var conf = ''
    Object.keys(data.conf).forEach((key) => {
      conf += ` ${key}=${JSON.stringify(data.conf[key])}`
    })
    // delete first space of the configuration
    conf = conf.slice(1)
    if (format === 'csv') {
      // Escape quotes (") for correct csv formatting
      conf = conf.replace(/"/g, '""')
      console.log(`"${data.name}", "${conf}", ${data.rate}, ${data.time}`)
    } else {
      var rate = data.rate.toString().split('.')
      rate[0] = rate[0].replace(/(\d)(?=(?:\d\d\d)+(?!\d))/g, '$1,')
      rate = (rate[1] ? rate.join('.') : rate[0])
      console.log(`${data.name} ${conf}: ${rate}`)
    }
  })

  child.once('close', function (code) {
    if (code) {
      process.exit(code)
      return
    }

    // If there are more benchmarks execute the next
    if (i + 1 < benchmarks.length) {
      recursive(i + 1)
    }
  })
})(0)
