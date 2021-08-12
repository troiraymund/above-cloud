const moment = require("moment");
const ApiHelper = require("./helpers/api");
const ObjectsToCsv = require('objects-to-csv');
require('dotenv').config();

const symbols = ['AUD','USD','EUR'];
let lastFiveDays = [];
let currencyRates = [];
let currencyIndex = {};
let csvArrData = [];
lastFiveDays.push(moment().format('YYYY-MM-DD'));

for (i = 1; i < 5; i++) {
  lastFiveDays.push(moment().subtract(i, 'days').format('YYYY-MM-DD'));
}

//Free tier API key has limits:
//Date range range cannot be specified. One call per specific date
const callAPI = async () => {
  const apiHelper = new ApiHelper();
  const fetchGbp = await apiHelper.getRates(['GBP'], 'latest');
  const eurToGbp = fetchGbp.rates.GBP;
  const allDone = Promise.all(lastFiveDays.map(async day => {
    const result = await apiHelper.getRates(symbols, day);
    currencyRates.push(result);
    return true;
  }));
  await allDone;

  const csv = new ObjectsToCsv(formatCsvArray(currencyRates, eurToGbp));
  csv.toDisk('./GBP-convertions.csv');

  return true;
}

//Format API result to follow x & y axis requirement
function formatCsvArray (currencyRates, eurToGbp) {
  let currObj = {};
  lastFiveDays.map(date => {
      currObj = {...currObj, [date]: 0};
  });
  symbols.map((symbol, x) => {
    currencyIndex[symbol] = x;
    csvArrData.push({'': symbol, ...currObj});
  });
  currencyRates.map(rate => {
    Object.entries(rate.rates).map(entry => {
      //Free tier only allows EUR base. To get convertion with GBP as base, divide EUR base results with EUR to GBP rate
      csvArrData[currencyIndex[entry[0]]][rate.date] = (entry[1] / eurToGbp).toFixed(5);
    });
  });
  return csvArrData;
}

callAPI();