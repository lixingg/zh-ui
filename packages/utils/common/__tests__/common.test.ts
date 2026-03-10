import { fromPairs } from '../common'

describe('通用工具函数测试', () => {
  test('test---fromPairs', () => {
    const testData = [
      ['fred', 30],
      ['barney', 40]
    ]
    const resData = { fred: 30, barney: 40 }
    expect(fromPairs(testData)).toStrictEqual(resData)
  })
})
