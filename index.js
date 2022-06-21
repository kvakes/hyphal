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
const zeroSeeders = 20;
const maxLayers = 8;
const numberOfTransactions = 1000000;
const DAOTreasuryFeePercentage = 1;
const maxAffiliateFeePercentage = 2;

let DAOTreasury = 0;
let allMycos = [];
let transactions = [];

// Myco
class Myco {
  constructor (layer, name, seeder) {
    this.layer = layer;
    this.name = name;
    this.seeder = seeder !== undefined ? seeder : null;
    this.mycos = [];
    this.txs = 0;
    this.sales = 0;
    this.fees = 0;
    this.net = 0; // sales - fees
    this.commission = 0;
    allMycos.push(this);
  }
  newSale (amount) {
    this.txs += 1;
    this.sales += amount;

    const DAOFee = roundToTwoDecimals(amount / 100 * DAOTreasuryFeePercentage);
    const affiliateFee = this.seeder === null ? 0 : this.seeder.distributeAffiliateFees(amount / 100 * maxAffiliateFeePercentage);
    const fees = DAOFee + affiliateFee;

    this.net += amount - fees;
    this.fees += fees;
    DAOTreasury += DAOFee;
  }
  distributeAffiliateFees (fee) {
    let commission = roundToTwoDecimals(fee / 2);
    this.commission += commission;
    return this.seeder === null ? commission : commission + this.seeder.distributeAffiliateFees(fee / 2);
  }
}

// Populate Layer 0
let layers = [];
layers[0] = [];
for (let l0 = 0; l0 < zeroSeeders; l0++) {
  let myco = new Myco(0, getNewName(), null);
  layers[0].push(myco);
}

// Populate layers 1 to 10
for (let l = layers.length; l < maxLayers; l++) {
  const prevLayer = layers[l - 1];
  let thisLayer = [];
  prevLayer.forEach(m => {
    for (let i = 0; i < benford(1, 30) - 1; i++) {
      let myco = new Myco(l, getNewName(), m);
      m.mycos.push(myco);
      thisLayer.push(myco);
    }
  });
  layers[l] = thisLayer;
}

// Simulate transactions
for (let t = 0; t < numberOfTransactions; t++) {
  let myco = allMycos[Math.floor(Math.random() * allMycos.length)];
  let amount = Math.floor(benford(1, 30) * 100);
  myco.newSale(amount);
}

// Show Network
const listChildrenRecursively = function (mycoList) {
  mycoList.forEach((e, i) => {
    console.log("-".repeat(e.layer * 2), e.name, " ".repeat(50 - e.layer * 2 - e.name.length), "#txs", e.txs, "+sales", e.sales, "-fees", roundToTwoDecimals(e.fees), "=net", roundToTwoDecimals(e.net), "%commission", roundToTwoDecimals(e.commission), "=total", roundToTwoDecimals(e.net + e.commission));
    listChildrenRecursively(e.mycos);
  });
}
listChildrenRecursively(layers[0]);

console.log("Total Number of Mycos:", allMycos.length);
console.log("Treasury:", DAOTreasury);

// Utils
function roundToTwoDecimals (n) {
  if (typeof n !== 'number') {
    throw("Can't round a non-number");
  }
  return Math.round(n * 100) / 100;
}