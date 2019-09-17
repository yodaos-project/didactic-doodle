const flora = require('flora')
const EventEmitter = require('events')

class Endoscope extends EventEmitter {
  agent = null;

  constructor (url = 'tcp://127.0.0.1:37800/') {
    super()
    this.agent = new flora.Agent(url)
    this.agent.subscribe('yodaos.endoscope.export', this.onEndoscopeExport)
  }

  onEndoscopeExport = (msg) => {
    const [name, labels = [], value = 0] = msg;
    if (name == null) {
      return
    }
    const label = labels.reduce((label, pair) => {
      label[pair[0]] = pair[1]
      return label
    }, {})
    this.emit(name, label, value)
  }

  nlp (text) {
    return this.agent.call('yodaos.voice-interface.nlp', [text], 'voice-interface', 60 * 1000)
  }

  start () {
    this.agent.start()
  }

  close () {
    this.agent.close()
  }
}

module.exports = Endoscope
