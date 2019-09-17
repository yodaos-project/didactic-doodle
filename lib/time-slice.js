class TimeSlice {
  memo = new Map()

  slice (label) {
    this.memo[label] = process.hrtime.bigint()
  }

  sliceEnd (label, offset) {
    const now = process.hrtime.bigint()
    let delta = now - this.memo[label]
    this.memo.delete(label)
    if (offset) {
      delta -= BigInt(offset)
    }
    console.log(`${label}: ${delta / BigInt(1e6)}ms`)
    return delta
  }

  clear () {
    this.memo.clear()
  }
}

module.exports = TimeSlice
