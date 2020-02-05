import DataManager from '../src/datamanage'
let tqData = null
const dataPack = {
  quotes: {
    'SHFE.cu1901': {
      name: 'cu1901',
      last_price: 1000
    },
    'SHFE.cu1902': {
      name: 'cu1902',
      last_price: 2000
    }
  }
}
const dataPack2 = {
  quotes: {
    'SHFE.cu1901': {
      last_price: 1001
    },
    'SHFE.cu1903': {
      name: 'cu1903',
      last_price: 3000
    }
  }
}
const kinesData = {}
for (let i = 1000; i <= 2000; i++) {
  kinesData[i] = i
}
const dataPack3 = {
  klines: {
    'SHFE.cu1901': {
      60000000000: {
        data: kinesData,
        last_id: 2000
      }
    }
  }
}
describe('test Datamanager', () => {
  test('test Datamanager Class', () => {
    tqData = new DataManager()
    expect(tqData).toBeInstanceOf(DataManager)
    tqData.mergeData(dataPack)
    expect(tqData._data.quotes['SHFE.cu1901'].name).toBe('cu1901')
    expect(tqData.isChanging(['quotes', 'SHFE.cu1901', 'name'])).toBe(true)
    expect(tqData.getByPath(['quotes', 'SHFE.cu1902', 'name'])).toBe('cu1902')
    expect(tqData.getByPath(['quotes', 'SHFE.cu1902', 'last_price'])).toBe(2000)
    expect(tqData.getByPath(['quotes', 'SHFE.cu1903', 'last_price'])).toBeFalsy()
    tqData.mergeData(dataPack2)
    expect(tqData._data.quotes['SHFE.cu1903'].name).toBe('cu1903')
    expect(tqData.isChanging(['quotes', 'SHFE.cu1902'])).toBe(false)
    expect(tqData.getByPath(['quotes', 'SHFE.cu1902', 'name'])).toBe('cu1902')
    expect(tqData.getByPath(['quotes', 'SHFE.cu1902', 'last_price'])).toBe(2000)
    tqData.mergeData(dataPack3)
    expect(tqData.getByPath(['klines', 'SHFE.cu1901', 60000000000, 'last_id'])).toBe(2000)
    expect(tqData.isChanging(['klines', 'SHFE.cu1901', 60000000000])).toBe(true)
    const klinesData = tqData.getByPath(['klines', 'SHFE.cu1901', 60000000000, 'data'])
    expect(klinesData).toBeInstanceOf(Array)
    expect(klinesData.length).toBe(2001)
    tqData.setDefault(['klines', 'SHFE.cu1902', 60000000000], { data: [], last_id: 2345 })
    expect(tqData.getByPath(['klines', 'SHFE.cu1902', 60000000000, 'last_id'])).toBe(2345)
    tqData.mergeData({
      klines: {
        'SHFE.cu1902': { 60000000000: null }
      }
    })
    expect(tqData.getByPath(['klines', 'SHFE.cu1902', 60000000000])).toBeNull()
  })
})
