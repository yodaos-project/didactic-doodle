const TDigest = require('tdigest').TDigest

class TimeSlice {
  memo = new Map()
  data = new Map()

  /**
   *
   * @param {string} label
   */
  slice (label) {
    this.memo.set(label, process.hrtime.bigint())
  }

  /**
   *
   * @param {string} label
   * @param {number | BigInt} offset
   */
  sliceEnd (label, offset) {
    const now = process.hrtime.bigint()
    let delta = now - this.memo.get(label)
    this.memo.delete(label)
    if (offset) {
      delta -= BigInt(offset)
    }
    this._record(label, delta)
    console.log(`${label}: ${delta / BigInt(1e6)}ms`)
    return delta
  }

  clear () {
    this.memo.clear()
  }

  export () {
    for (let [key, arr] of this.data.entries()) {
      const digest = new TDigest()
      digest.push(arr.map(Number).map(it => it / 1e6))
      digest.compress()
      console.log(`# ${key}`)
      console.log(digest.summary())
    }
  }

  /**
   * @private
   * @param {string} label
   * @param {BigInt} dp - data point
   */
  _record (label, dp) {
    let arr = this.data.get(label)
    if (arr == null) {
      arr = []
      this.data.set(label, arr)
    }
    arr.push(dp)
  }
}

module.exports = TimeSlice
