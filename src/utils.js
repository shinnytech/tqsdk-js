const UnifyArrayStyle = (path, splitSymbol = '/') => {
  if (!Array.isArray(path)) path = path.split(splitSymbol)
  return path.filter(x => x !== '')
}

const IsEmptyObject = (obj) => {
  return obj && obj.constructor === Object && Object.keys(obj).length === 0
}

const RandomStr = (len = 8) => {
  const charts = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  let s = ''
  for (let i = 0; i < len; i++) s += charts[(Math.random() * 0x3e) | 0]
  return s
}

function _genList (str) {
  // string 根据 | 分割为数组
  const list = []
  const items = str.split('|')
  for (let i = 0; i < items.length; i++) {
    list.push(items[i].trim()) // NOTE: 有些竖线之间内容为空
  }
  return list
}

function _genItem (keys, values) {
  // 根据 keys - values 返回 object
  const item = {}
  for (let j = 0; j < keys.length; j++) {
    item[keys[j]] = values[j]
  }
  return item
}

function _genTableRow (state, stateDetail, colNames, line) {
  // 根据 参数 处理表格的一行
  const result = {
    state: state,
    state_detail: stateDetail,
    isRow: false,
    row: null
  }
  switch (stateDetail) {
    case 'T': // title
      if (line.replace(/-/g, '') === '') {
        result.state_detail = 'C'
      } else {
        colNames[state] = _genList(line)
      }
      break
    case 'C': // content
      if (line.replace(/-/g, '') === '') {
        result.state_detail = 'S'
      } else {
        result.isRow = true
        result.row = _genItem(colNames[state], _genList(line))
      }
      break
    case 'S':
      if (line.replace(/-/g, '') === '') {
        result.state = ''
        result.state_detail = ''
      }
      break
  }
  return result
}

const ParseSettlementContent = (txt = '') => {
  if (txt === '') return txt
  const lines = txt.split('\n')
  let state = '' // A = Account Summary; T = Transaction Record; PD = Positions Detail; P = Positions
  let stateDetail = '' // T = title; C = content; S = summary
  const colNames = {}

  // 需要处理的表格
  const tableStatesTitles = {
    positionClosed: '平仓明细 Position Closed',
    transactionRecords: '成交记录 Transaction Record',
    positions: '持仓汇总 Positions',
    positionsDetail: '持仓明细 Positions Detail',
    delivery: '交割明细  Delivery'
  }

  const states = []
  const titles = []
  const result = { account: {} }

  Object.entries(tableStatesTitles).forEach(function (item) {
    states.push(item[0])
    titles.push(item[1])
    result[item[0]] = []
  })

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.indexOf('资金状况') > -1) {
      state = 'A-S'
      i++
      continue
    } else if (titles.includes(line)) {
      state = states[titles.indexOf(line)]
      stateDetail = 'T'
      i++
      continue
    }

    if (state === 'A-S') {
      if (line.length === 0 || line.replace('-', '') === '') {
        state = ''
        continue
      } else {
        // eslint-disable-next-line no-unused-vars
        const chMatches = line.match(/([\u4e00-\u9fa5][\u4e00-\u9fa5\s]+[\u4e00-\u9fa5])+/g) // 中文
        // eslint-disable-next-line no-useless-escape
        const enMatches = line.match(/([A-Z][a-zA-Z\.\/\(\)\s]+)[:：]+/g) // 英文
        const numMatches = line.match(/(-?[\d]+\.\d\d)/g) // 数字
        for (let j = 0; j < enMatches.length; j++) {
          result.account[enMatches[j].split(/[:：]/)[0]] = numMatches[j]
        }
      }
    } else if (states.includes(state)) {
      if (line.length === 0) {
        state = ''
        continue
      } else {
        const tableRow = _genTableRow(state, stateDetail, colNames, line)
        state = tableRow.state
        stateDetail = tableRow.state_detail
        if (tableRow.isRow) {
          result[state].push(tableRow.row)
        }
      }
    }
  }
  return result
}

export {
  UnifyArrayStyle,
  IsEmptyObject,
  RandomStr,
  ParseSettlementContent
}
