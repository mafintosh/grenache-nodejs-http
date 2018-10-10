'use strict'

const Base = require('grenache-nodejs-base')
const TransportPeerStreamClient = require('./TransportPeerRPCStreamClient.js')
const duplexify = require('duplexify')

class PeerStreamClient extends Base.PeerRPCClient {
  getTransportClass () {
    return TransportPeerStreamClient
  }

  getRequestOpts (opts) {
    return {
      timeout: opts.timeout,
      headers: opts.headers
    }
  }

  stream (key, opts) {
    const dup = duplexify()

    this.link.lookup(key, {}, (err, dests) => {
      if (err) {
        dup.emit('error', err)
        return
      }

      const dest = this.dest(dests, key, this.getDestOpts(opts))
      const t = this.transport(dest, this.getTransportOpts(opts))

      const req = t.request(key, null, this.getRequestOpts(opts))

      dup.setWritable(req)
      req.on('response', (res) => {
        dup.setReadable(res)
      })
    })

    return dup
  }
}

module.exports = PeerStreamClient
