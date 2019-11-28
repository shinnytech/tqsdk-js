const can1 = {
  flavor: 'grapefruit',
  ounces: 12
}
const can11 = can1
const can2 = {
  flavor: 'grapefruit',
  ounces: 12
}
describe('the La Croix cans on my desk', () => {
  test('have all the same properties', () => {
    expect(can1).toEqual(can2)
    expect(Object.is(can1, can11)).toBe(true)
  })
  test('are not the exact same can', () => {
    expect(can1).not.toBe(can2)
    expect(can1).toBe(can11)
    expect(Object.is(can1, can11)).toBe(true)
  })
})
