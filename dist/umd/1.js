DataManager = require('../esm/tqsdk.min').DataManager
console.log(DataManager)
a = 5
b = a + 9
let data = {}
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
const tqData = new DataManager()
tqData.setDefault(['klines', 'SHFE.cu1902', 60000000000], { data: [], last_id: 2345 })

DataManager.MergeObject(data, dataPack)
DataManager.MergeObject(data, dataPack2)
data.quotes