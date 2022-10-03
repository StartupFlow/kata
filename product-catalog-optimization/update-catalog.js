const fs = require('fs');
const { MongoClient } = require('mongodb');
const Promise = require('bluebird');

const { memory } = require('./helpers/memory');
const { timing } = require('./helpers/timing');
const { Metrics } = require('./helpers/metrics');
const { Product } = require('./product');

const MONGO_URL = 'mongodb://localhost:27017/test-product-catalog';
const catalogUpdateFile = 'updated-catalog.csv';

async function main() {
  const mongoClient = new MongoClient(MONGO_URL);
  const connection = await mongoClient.connect();
  const db = connection.db();
  await memory(
    'Update dataset',
    () => timing(
      'Update dataset',
      () => updateDataset(db)));
}

async function updateDataset(db) {
  const csvContent = fs.readFileSync(catalogUpdateFile, 'utf-8');
  const rowsWithHeader = csvContent.split('\n');
  const dataRows = rowsWithHeader.slice(1);// skip headers

  const metrics = Metrics.zero();
  function updateMetrics(updateResult) {
    if (updateResult.nModified) {
      metrics.updatedCount += updateResult.nModified;
    }
    if (updateResult.nUpserted) {
      metrics.addedCount += updateResult.nUpserted;
    }
  }

  const dbCatalogSize = await db.collection('Products').count();
  const closestPowOf10 = 10 ** (Math.ceil(Math.log10(dbCatalogSize)));

  function logProgress(nbCsvRows) {
    const progressIndicator = nbCsvRows * 100 / closestPowOf10;
    if (progressIndicator % 10 === 0) {
      console.debug(`[DEBUG] Processed ${nbCsvRows} rows...`);
    }
  }
  let batch =  db.collection('Products').initializeOrderedBulkOp();
  await db.collection('Products').createIndex( { _id: 1 } );
  const products = dataRows.filter(dataRow => dataRow).map(row => Product.fromCsv(row));

  products.forEach((product, i) => {
    batch.find({ _id: product._id }).upsert().updateOne({ $set: product });
    logProgress(i);
  });

  const ids = products.map(p => p._id);
  batch.find({_id: { $nin: ids}}, {_id: 1}).delete();

  await batch.execute();
  const bulkResult = batch.s.bulkResult;
  updateMetrics(bulkResult);
  if (bulkResult.nRemoved) {
    metrics.deletedCount += bulkResult.nRemoved;
  }
  logMetrics(dataRows.length - 1, metrics);// dataRows.length-1 because there is a new line at the end of file.
}

function logMetrics(numberOfProcessedRows, metrics) {
  console.info(`[INFO] Processed ${numberOfProcessedRows} CSV rows.`);
  console.info(`[INFO] Added ${metrics.addedCount} new products.`);
  console.info(`[INFO] Updated ${metrics.updatedCount} existing products.`);
  console.info(`[INFO] Deleted ${metrics.deletedCount} products.`);
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('SUCCESS');
      process.exit(0);
    })
    .catch(err => {
      console.log('FAIL');
      console.error(err);
      process.exit(1);
    });
}
