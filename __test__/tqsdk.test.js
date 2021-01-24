const TQSDK = require('../dist/umd/tqsdk-nocache')
const WebSocket = require('ws')
let tqsdk = null
const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }

describe('TQSDK init', () => {
  beforeEach(() => {
    tqsdk = new TQSDK({}, { WebSocket })
  })

  afterEach(() => {
    tqsdk.quotesWs.close()
    for (const k in tqsdk.trade_accounts) {
      tqsdk.trade_accounts[k].ws.close()
    }
  })

  test('TQSDK ready', done => {
    tqsdk.on('ready', function () {
      try {
        const quote = tqsdk.getQuote('SHFE.cu2106')
        expect(quote.ins_id).toBe('cu2106')
        expect(quote.exchange_id).toBe('SHFE')
        done()
      } catch (error) {
        done(error)
      }
    })
  }, 20000)

  test('TQSDK rtn_brokers', done => {
    tqsdk.on('rtn_brokers', function (brokers) {
      try {
        expect(brokers.indexOf('快期模拟') > -1).toBeTruthy()
        done()
      } catch (error) {
        done(error)
      }
    })
  })

  test('TQSDK account login', done => {
    tqsdk.on('rtn_brokers', function (brokers) {
      tqsdk.login(account)
    })
    tqsdk.on('rtn_data', function () {
      try {
        if (tqsdk.isLogined(account)) {
          expect(tqsdk.getAccount(account).user_id).toBe('test123')
          done()
        }
      } catch (error) {
        done(error)
      }
    })
  }, 20000)
})
