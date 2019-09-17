'use strict'

const { once } = require('events')

const TimeSlice = require('../../lib/time-slice')
const Endoscope = require('../../lib/endoscope')
const common = require('../common.js')
const bench = common.createBenchmark(main, {
  n: [16]
})

async function run (endoscope, slicer) {
  slicer.slice('NLP - Pending Url')
  await endoscope.nlp('当前电量')

  const [, val] = await once(endoscope, 'yodaos:runtime:open_url_duration')
  slicer.sliceEnd('NLP - Pending Url', val)
  console.log(`Open Url: ${val}ms`)

  slicer.slice('Speech Synthesis Start')
  for (;;) {
    const [{ state }] = await once(endoscope, 'yodaos:speech-synthesis:event')
    if (state === 'start') {
      slicer.sliceEnd('Speech Synthesis Start')
      slicer.slice('Speech Synthesis')
      continue
    }
    slicer.sliceEnd('Speech Synthesis')
    break
  }
}

async function main (opts) {
  const n = opts.n
  const endoscope = new Endoscope()
  endoscope.start()

  const slicer = new TimeSlice()
  bench.start()
  for (let i = 0; i < n; ++i) {
    await run(endoscope, slicer)
    slicer.clear()
  }
  bench.end(n)
  slicer.export()
  endoscope.close()
}
