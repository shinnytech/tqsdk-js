import {
  UnifyArrayStyle,
  IsEmptyObject,
  RandomStr
} from '../src/utils'
const loop = () => {}
describe('test utils', () => {
  test('IsEmptyObject func', () => {
    const a = {}
    expect(IsEmptyObject(a)).toBe(true)
    a.xx = '123'
    expect(IsEmptyObject(a)).toBe(false)
    expect(IsEmptyObject(123)).toBe(false)
    expect(IsEmptyObject([])).toBe(false)
    expect(IsEmptyObject(loop)).toBe(false)
    expect(IsEmptyObject(null)).toBeFalsy()
    expect(IsEmptyObject(undefined)).toBeFalsy()
    expect(IsEmptyObject(NaN)).toBeFalsy()
  })

  test('UnifyArrayStyle func', () => {
    expect(UnifyArrayStyle([1, 3])).toEqual([1, 3])
    expect(UnifyArrayStyle('a/ds/er')).toEqual(['a', 'ds', 'er'])
    expect(UnifyArrayStyle('a*ds*er', '*')).toEqual(['a', 'ds', 'er'])
  })

  test('RandomStr func', () => {
    expect(RandomStr().length).toEqual(8)
    expect(RandomStr(8).length).toEqual(8)
    expect(RandomStr(14).length).toEqual(14)
  })
})
