/*
// reference types from original dataset.ts

// An error function and its derivative.
export interface ErrorFunction {
  error: (output: number, target: number) => number;
  der: (output: number, target: number) => number;
}

// A node's activation function and its derivative.
export interface ActivationFunction {
  output: (input: number) => number;
  der: (input: number) => number;
}

// Function that computes a penalty cost for a given weight in the network.
export interface RegularizationFunction {
  output: (weight: number) => number;
  der: (weight: number) => number;
}
*/

/** Built-in error functions */
export const Errors = {
  SQUARE: {
    error: (output, target) => 0.5 * Math.pow(output - target, 2),
    der: (output, target) => output - target,
  },
}

/** Built-in activation functions */
export const Activations = {
  TANH: {
    label: 'TANH',
    output: Math.tanh,
    der: (x) => {
      const output = Activations.TANH.output(x)
      return 1 - output * output
    },
  },
  RELU: {
    label: 'RELU',
    output: (x) => Math.max(0, x),
    der: (x) => x <= 0 ? 0 : 1,
  },
  SIGMOID: {
    label: 'SIGMOID',
    output: (x) => 1 / (1 + Math.exp(-x)),
    der: (x) => {
      const output = Activations.SIGMOID.output(x)
      return output * (1 - output)
    },
  },
  LINEAR: {
    label: 'LINEAR',
    output: x => x,
    der: x => 1,
  },
}

/** Build-in regularization functions */
export const Regularizations = {
  None: {
    label: 'None',
    output: () => {},
    der: () => {},
  },
  L1: {
    label: 'L1',
    output: Math.abs,
    der: (w) => w < 0 ? -1 : (w > 0 ? 1 : 0),
  },
  L2: {
    label: 'L2',
    output: (w) => 0.5 * w * w,
    der: (w) => w,
  },
}

/**
 * A node in a neural network. Each node has a state
 * (total input, output, and their respectively derivatives) which changes
 * after every forward and back propagation run.
 */
export class Node {
  id // shape string
  /** List of input links. */
  inputLinks = [] // shape Link[]
  bias = 0.1
  /** List of output links. */
  outputs = [] // shape Link[]
  totalInput // shape number
  output // shape number
  /** Error derivative with respect to this node's output. */
  outputDer = 0;
  /** Error derivative with respect to this node's total input. */
  inputDer = 0;
  /**
   * Accumulated error derivative with respect to this node's total input since
   * the last update. This derivative equals dE/db where b is the node's
   * bias term.
   */
  accInputDer = 0
  /**
   * Number of accumulated err. derivatives with respect to the total input
   * since the last update.
   */
  numAccumulatedDers = 0
  /** Activation function that takes total input and returns node's output */
  activation // shape ActivationFunction

  /**
   * Creates a new node with the provided id and activation function.
   */
  constructor(id, activation, initZero = false) {
    this.id = id
    this.activation = activation
    if (initZero) {
      this.bias = 0
    }
  }

  /** Recomputes the node's output and returns it. */
  updateOutput() {
    // Stores total input into the node.
    this.totalInput = this.bias
    for (let j = 0; j < this.inputLinks.length; j++) {
      let link = this.inputLinks[j]
      this.totalInput += link.weight * link.source.output
    }
    this.output = this.activation.output(this.totalInput)
    return this.output
  }
}

/**
 * A link in a neural network. Each link has a weight and a source and
 * destination node. Also it has an internal state (error derivative
 * with respect to a particular input) which gets updated after
 * a run of back propagation.
 */
export class Link {
  id // shape string
  source // shape Node
  dest // shape Node
  weight = Math.random() - 0.5
  isDead = false
  /** Error derivative with respect to this weight. */
  errorDer = 0
  /** Accumulated error derivative since the last update. */
  accErrorDer = 0
  /** Number of accumulated derivatives since the last update. */
  numAccumulatedDers = 0
  regularization // shape RegularizationFunction

  /**
   * Constructs a link in the neural network initialized with random weight.
   *
   * @param source The source node.
   * @param dest The destination node.
   * @param regularization The regularization function that computes the
   *     penalty for this weight. If null, there will be no regularization.
   */
  constructor(source, dest, regularization, initZero = false) {
    this.id = `${source.id} - ${dest.id}`
    this.source = source
    this.dest = dest
    this.regularization = regularization
    if (initZero) {
      this.weight = 0
    }
  }
}

/**
 * Builds a neural network.
 *
 * @param networkShape The shape of the network. E.g. [1, 2, 3, 1] means
 *   the network will have one input node, 2 nodes in first hidden layer,
 *   3 nodes in second hidden layer and 1 output node.
 * @param activation The activation function of every hidden node.
 * @param outputActivation The activation function for the output nodes.
 * @param regularization The regularization function that computes a penalty
 *     for a given weight (parameter) in the network. If null, there will be
 *     no regularization.
 * @param inputIds List of ids for the input nodes.
 *
 * @returns Node[][]
 */
export function buildNetwork(
  networkShape,
  activation,
  outputActivation,
  regularization,
  inputIds,
  initZero = false,
) {
  const numLayers = networkShape.length
  let id = 1
  /** List of layers, with each layer being a list of nodes. */
  const network = [] // shape Node[][]

  for (let layerIdx = 0; layerIdx < numLayers; layerIdx++) {
    const isOutputLayer = layerIdx === numLayers - 1
    const isInputLayer = layerIdx === 0
    const currentLayer = [] // shape Node[]
    network.push(currentLayer)
    const numNodes = networkShape[layerIdx]
    for (let i = 0; i < numNodes; i++) {
      let nodeId = id.toString()
      if (isInputLayer) {
        nodeId = inputIds[i]
      } else {
        id++
      }
      const node = new Node(nodeId, isOutputLayer ? outputActivation : activation, initZero)
      currentLayer.push(node)
      if (layerIdx >= 1) {
        // Add links from nodes in the previous layer to this node.
        for (let j = 0; j < network[layerIdx - 1].length; j++) {
          const prevNode = network[layerIdx - 1][j]
          const link = new Link(prevNode, node, regularization, initZero)
          prevNode.outputs.push(link)
          node.inputLinks.push(link)
        }
      }
    }
  }
  return network
}

/**
 * Runs a forward propagation of the provided input through the provided
 * network. This method modifies the internal state of the network - the
 * total input and output of each node in the network.
 *
 * @param network The neural network. shape Node[][]
 * @param inputs The input array. Its length should match the number of input
 *     nodes in the network.
 * @return The final output of the network.
 */
export function forwardProp(network, inputs) {
  const inputLayer = network[0]
  if (inputs.length !== inputLayer.length) {
    throw new Error('The number of inputs must match the number of nodes in the input layer')
  }
  // Update the input layer.
  for (let i = 0; i < inputLayer.length; i++) {
    const node = inputLayer[i];
    node.output = inputs[i];
  }
  for (let layerIdx = 1; layerIdx < network.length; layerIdx++) {
    const currentLayer = network[layerIdx]
    // Update all the nodes in this layer.
    for (let i = 0; i < currentLayer.length; i++) {
      const node = currentLayer[i]
      node.updateOutput()
    }
  }
  return network[network.length - 1][0].output;
}

/**
 * Runs a backward propagation using the provided target and the
 * computed output of the previous call to forward propagation.
 * This method modifies the internal state of the network - the error
 * derivatives with respect to each node, and each weight
 * in the network.
 * @param network The neural network. shape Node[][]
 * @param target target number
 */
export function backProp(network, target, errorFunc) {
  // The output node is a special case. We use the user-defined error
  // function for the derivative.
  const outputNode = network[network.length - 1][0];
  outputNode.outputDer = errorFunc.der(outputNode.output, target);

  // Go through the layers backwards.
  for (let layerIdx = network.length - 1; layerIdx >= 1; layerIdx--) {
    const currentLayer = network[layerIdx];
    // Compute the error derivative of each node with respect to:
    // 1) its total input
    // 2) each of its input weights.
    for (let i = 0; i < currentLayer.length; i++) {
      const node = currentLayer[i];
      node.inputDer = node.outputDer * node.activation.der(node.totalInput);
      node.accInputDer += node.inputDer;
      node.numAccumulatedDers++;
    }

    // Error derivative with respect to each weight coming into the node.
    for (let i = 0; i < currentLayer.length; i++) {
      const node = currentLayer[i];
      for (let j = 0; j < node.inputLinks.length; j++) {
        const link = node.inputLinks[j];
        if (link.isDead) {
          continue;
        }
        link.errorDer = node.inputDer * link.source.output;
        link.accErrorDer += link.errorDer;
        link.numAccumulatedDers++;
      }
    }
    if (layerIdx === 1) {
      continue;
    }
    const prevLayer = network[layerIdx - 1];
    for (let i = 0; i < prevLayer.length; i++) {
      const node = prevLayer[i];
      // Compute the error derivative with respect to each node's output.
      node.outputDer = 0;
      for (let j = 0; j < node.outputs.length; j++) {
        const output = node.outputs[j];
        node.outputDer += output.weight * output.dest.inputDer;
      }
    }
  }
}

/**
 * Updates the weights of the network using the previously accumulated error
 * derivatives.
 * @param network. shape Node[][]
 * @param learningRate. shape number
 * @param regularizationRate. shape number
 */
export function updateWeights(network, learningRate, regularizationRate) {
  for (let layerIdx = 1; layerIdx < network.length; layerIdx++) {
    const currentLayer = network[layerIdx];
    for (let i = 0; i < currentLayer.length; i++) {
      const node = currentLayer[i];
      // Update the node's bias.
      if (node.numAccumulatedDers > 0) {
        node.bias -= learningRate * node.accInputDer / node.numAccumulatedDers;
        node.accInputDer = 0;
        node.numAccumulatedDers = 0;
      }
      // Update the weights coming into this node.
      for (let j = 0; j < node.inputLinks.length; j++) {
        const link = node.inputLinks[j];
        if (link.isDead) {
          continue;
        }
        const regulDer = link.regularization ? link.regularization.der(link.weight) : 0;
        if (link.numAccumulatedDers > 0) {
          // Update the weight based on dE/dw.
          link.weight = link.weight - (learningRate / link.numAccumulatedDers) * link.accErrorDer;
          // Further update the weight based on regularization.
          const newLinkWeight = link.weight - (learningRate * regularizationRate) * regulDer;
          if (link.regularization === Regularizations.L1 && link.weight * newLinkWeight < 0) {
            // The weight crossed 0 due to the regularization term. Set it to 0.
            link.weight = 0;
            link.isDead = true;
          } else {
            link.weight = newLinkWeight;
          }
          link.accErrorDer = 0;
          link.numAccumulatedDers = 0;
        }
      }
    }
  }
}

/**
 * Iterates over every node in the network
 * @param network. shape Node[][]
 * @param ignoreInputs. shape boolean
 * @param accessor. shape function (node: Node) => any
 */
export function forEachNode(network, ignoreInputs, accessor = () => {}) {
  for (let layerIdx = ignoreInputs ? 1 : 0; layerIdx < network.length; layerIdx++) {
    const currentLayer = network[layerIdx];
    for (let i = 0; i < currentLayer.length; i++) {
      const node = currentLayer[i];
      accessor(node);
    }
  }
}

/**
 * Returns the output node in the network.
 * @param network. shape Node[][]
 */
export const getOutputNode = (network) => network[network.length - 1][0]
