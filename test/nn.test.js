import {
  Errors,
  Activations,
  RegularizationFunction,
} from '../src/lib/nn'


describe('Errors', () => {
  const inputs = [
    [1, 2],
    [5, 1],
  ]
  test('.error(output, target)', () => {
    expect(Errors.error(...inputs[0])).toBe(0.5)
    expect(Errors.error(...inputs[1])).toBe(8)
  })

  test('.der(output, target)', () => {
    expect(Errors.der(...inputs[0])).toBe(inputs[0][0] - inputs[0][1])
    expect(Errors.der(...inputs[1])).toBe(inputs[1][0] - inputs[1][1])
  })
})

describe('Activations', () => {
  const x = 5

  describe('TANH', () => {
    test('.output(x)', () => {
      expect(Activations.TANH.output(x)).toBe(Math.tanh(x))
    })

    test('.der(x)', () => {
      expect(Activations.TANH.der(x)).toBe(0.0001815832309438603)
    })
  })

  describe('RELU', () => {
    test('.output(x)', () => {
      expect(Activations.RELU.output(x)).toBe(x)
      expect(Activations.RELU.output(-1)).toBe(0)
    })

    test('.der(x)', () => {
      expect(Activations.RELU.der(x)).toBe(1)
      expect(Activations.RELU.der(-1)).toBe(0)
      expect(Activations.RELU.der(0)).toBe(0)
    })
  })

  describe('SIGMOID', () => {
    test('.output(x)', () => {
      expect(Activations.SIGMOID.output(x)).toBe(0.9933071490757153)
      expect(Activations.SIGMOID.output(0)).toBe(0.5)
    })

    test('.der(x)', () => {
      expect(Activations.SIGMOID.der(x)).toBe(0.006648056670790033)
      expect(Activations.SIGMOID.der(0)).toBe(0.25)
    })
  })

  describe('LINEAR', () => {
    const y = Math.random()

    test('.output(x)', () => {
      expect(Activations.RELU.output(x)).toBe(x)
      expect(Activations.RELU.output(y)).toBe(y)
    })

    test('.der(x)', () => {
      expect(Activations.RELU.der(x)).toBe(1)
      expect(Activations.RELU.der(y)).toBe(1)
    })
  })
})
