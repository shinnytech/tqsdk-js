const assert = require('assert')
const TQSDK = require('../dist/umd/tqsdk-nocache')
const WebSocket = require('ws')
let tqsdk = null
const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }

describe('TQSDK init', () => {
  beforeEach(() => {
    tqsdk = new TQSDK({}, { WebSocket })
  })

  test('TQSDK ready', done => {
    tqsdk.on('ready', function () {
      const quote = tqsdk.getQuote('SHFE.cu2006')
      expect(quote.ins_id).toBe('cu2006')
      expect(quote.exchange_id).toBe('SHFE')
      done()
    })
  })

  test('TQSDK rtn_brokers', done => {
    tqsdk.on('rtn_brokers', function (brokers) {
      expect(brokers.indexOf('快期模拟') > -1).toBeTruthy()
      done()
    })
  })
})

describe('TQSDK login', () => {
  beforeAll(() => {
    tqsdk = new TQSDK({}, { WebSocket })
    tqsdk.on('rtn_brokers', function (brokers) {
      tqsdk.login(account)
    })
  })

  test('TQSDK account login', done => {
    tqsdk.on('rtn_data', function () {
      if (tqsdk.isLogined(account)) {
        expect(tqsdk.getAccount(account).user_id).toBe('test123')
        done()
      }
    })
  })
})
