const fs = require('fs');
const { MongoClient } = require('mongodb');
const Promise = require('bluebird');

const { memory } = require('./helpers/memory');
const { timing } = require('./helpers/timing');
const { Metrics } = require('./helpers/metrics');
const { Product } = require('./product');

const MONGO_URL = 'mongodb://127.0.0.1:27017/test-product-catalog';
const fileName = 'updated-catalog';
const fileExtension = '.csv';
const catalogDeleteFile = 'deleted-catalog.csv';

// -----------------------------------------------------------------------------------------------------
// @ Bootstrap
// -----------------------------------------------------------------------------------------------------

async function main() {
  const mongoClient = new MongoClient(MONGO_URL);
  const connection = await mongoClient.connect();
  const db = connection.db();
  await memory('Update dataset', () => timing('Update dataset', () => updateDataset(db)));
}

// -----------------------------------------------------------------------------------------------------
// @ Dataset Update
// -----------------------------------------------------------------------------------------------------

async function updateDataset(db) {
  // Identifies the file in which the deleted products are stored.
  const deleteFile = fs.readdirSync(__dirname).find((file) => file === catalogDeleteFile);

  // Identifies the files in which the updated products are stored.
  const filesList = fs.readdirSync(__dirname).filter((file) => {
    const isCsvFile = file.includes(fileName) && file.includes(fileExtension);
    if (isCsvFile && fs.existsSync(file)) return file;
  });

  const metrics = Metrics.zero();
  const dbCatalogSize = await db.collection('Products').count();
  const closestPowOf10 = 10**(Math.ceil(Math.log10(dbCatalogSize)));
  let dataRowsLength = 0;

  await Promise.all(
    filesList.map(async (file) => {

      const csvContent = fs.readFileSync(file, 'utf-8');
      const rowsWithHeader = csvContent.split('\n');
      const dataRows = rowsWithHeader.slice(1);
      dataRowsLength += dataRows.length;

      // Maps an updateOne / upsert instruction for each row
      const updateInstructions = await Promise.all(dataRows.map(async (row) => {
        return new Promise(resolve => {
          const productRow = Product.fromCsv(row);
          resolve({
            updateOne: {
              filter: { _id: productRow._id },
              update: { $set: productRow },
              upsert: true
            }
          })
        });
      }));

      // Updates database by bulk
      const updateResult = await db.collection('Products').bulkWrite(updateInstructions);
      if (updateResult.nModified) metrics.updatedCount += updateResult.nModified;
      if (updateResult.nUpserted) metrics.addedCount += updateResult.nUpserted;
    })
  )

  const deleteCsvContent = fs.readFileSync(deleteFile, 'utf-8');
  const deleteRowsWithHeader = deleteCsvContent.split('\n');
  const deleteDataRows = deleteRowsWithHeader.slice(1); // skip header

  // Mapping products ids from the deleted products file + collection.deleteMany(). 
  const deletedProductIds = deleteDataRows.map((row) => Product.fromCsv(row)._id).filter((id) => id !== '');
  const deletedResults = await db.collection('Products').deleteMany({_id: { $in: deletedProductIds}});

  if (deletedResults && deletedResults?.deletedCount) {
    metrics.deletedCount += deletedResults.deletedCount;
  }

  logMetrics(dataRowsLength - 1, metrics); // dataRows.length - 1 because there is a new line at the end of file.
}

// -----------------------------------------------------------------------------------------------------
// @ Utils
// -----------------------------------------------------------------------------------------------------

function logProgress(nbCsvRows) {
  const progressIndicator = nbCsvRows * 100 / closestPowOf10;
  if (progressIndicator % 10 === 0) {
    console.debug(`[DEBUG] Processed ${nbCsvRows} rows...`);
  }
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