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
    if (updateResult.modifiedCount) {
      metrics.updatedCount += 1;
    }
    if (updateResult.upsertedCount) {
      metrics.addedCount += 1;
    }
  }

  const dbCatalogSize = await db.collection('Products').count();
  const closestPowOf10 = 10**(Math.ceil(Math.log10(dbCatalogSize)));
  function logProgress(nbCsvRows) {
    const progressIndicator = nbCsvRows * 100 / closestPowOf10;
    if (progressIndicator%10 === 0) {
      console.debug(`[DEBUG] Processed ${nbCsvRows} rows...`);
    }
  }

  const products = dataRows.filter(dataRow => dataRow).map(row => Product.fromCsv(row));
  await Promise.map(products, async (product, i) => {
    const updateResult = await db.collection('Products')
      .updateOne(
        { _id: product._id },
        { $set: product },
        { upsert: true });
    updateMetrics(updateResult);
    logProgress(i);
  });

  const dbIds = (await db.collection('Products').find({}, {_id: 1}).toArray()).map(o => o._id);
  const isDeletedId = id => !products.find(p => p._id === id);
  const deletedProductIds = dbIds.filter(id => isDeletedId(id));
  for (const pId of deletedProductIds) {
    const deleteResult = await db.collection('Products').deleteOne({_id: pId});
    if (deleteResult.deletedCount) {
      metrics.deletedCount += 1;
    }
  }

  logMetrics(dataRows.length-1, metrics);// dataRows.length-1 because there is a new line at the end of file.
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
