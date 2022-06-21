const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

// Benford distribution
const uniform = (min, max) => Math.random() * (max - min) + min;
const benford = (min, max) => Math.exp(uniform(Math.log(min), Math.log(max)));

// Names
const getNewName = function () {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals, colors],
    style: 'capital',
    separator: ' ',
    length: 2
  });
}

// SET UP
const zeroSeeders = 10;
const maxLayers = 4;

// All Mycos
let allMycos = [];

// Myco
class Myco {
  constructor (layer, name) {
    this.layer = layer;
    this.name = name;
    this.mycos = [];
    allMycos.push(this);
  }
}

// Populate Layer 0
let layers = [];
layers[0] = [];
for (let l0 = 0; l0 < zeroSeeders; l0++) {
  let myco = new Myco(0, getNewName());
  layers[0].push(myco);
}

// Populate layers 1 to 10
for (let l = layers.length; l < maxLayers; l++) {
  const prevLayer = layers[l - 1];
  let thisLayer = [];
  prevLayer.forEach((e, i) => {
    for (let m = 0; m < benford(1, 30) - 1; m++) {
      let myco = new Myco(l, getNewName());
      e.mycos.push(myco);
      thisLayer.push(myco);
    }
  });
  layers[l] = thisLayer;
}

// Show Network
const listChildrenRecursively = function (mycoList) {
  mycoList.forEach((e, i) => {
    console.log("-".repeat(e.layer * 2), e.name);
    listChildrenRecursively(e.mycos);
  });
}
listChildrenRecursively(layers[0]);

console.log("Total Number of Mycos:", allMycos.length);