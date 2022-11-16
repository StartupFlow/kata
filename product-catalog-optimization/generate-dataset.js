const fs = require('fs');
const uuidv4 = require('uuid').v4;
const { MongoClient } = require('mongodb');
const minimist = require('minimist');

const { timing } = require('./helpers/timing');
const { memory } = require('./helpers/memory');
const { Metrics } = require('./helpers/metrics');
const { Product } = require('./product');

const DATABASE_NAME = 'test-product-catalog';
const MONGO_URL = `mongodb://127.0.0.1:27017/${DATABASE_NAME}`;
const fileName = 'updated-catalog';
const fileExtension = '.csv';
const catalogDeleteFile = 'deleted-catalog.csv';
const chunkSize = 5000;

const { size } = minimist(process.argv.slice(2));

if (!size) {
  throw new Error("Missing 'size' parameter");
}

// -----------------------------------------------------------------------------------------------------
// @ Bootstrap
// -----------------------------------------------------------------------------------------------------

async function main() {
  const mongoClient = new MongoClient(MONGO_URL);
  const connection = await mongoClient.connect();
  const db = connection.db();

  // For running the script several times without manually cleaning the data
  await clearExistingData(db)
  await memory('Generate dataset', () => timing('Generate dataset', () => generateDataset(db, size)));
}

async function clearExistingData(db) {
  const listDatabaseResult = await db.admin().listDatabases({ nameOnly: 1 });

  if (listDatabaseResult.databases.find(d => d.name === DATABASE_NAME)) await db.dropDatabase();
  clearSourceFiles();
}

/**
 * Removes all catalog chunk files & deleted products file
 */
function clearSourceFiles() {
  fs.readdirSync(__dirname).forEach((file) => {
    const deleteFile = file.includes(fileName) && file.includes(fileExtension);
    if (deleteFile && fs.existsSync(file)) fs.rm(file, () => {});
  });

  if (fs.existsSync(catalogDeleteFile)) {
    fs.rmSync(catalogDeleteFile);
  }
}

// -----------------------------------------------------------------------------------------------------
// @ Dataset Generation
// -----------------------------------------------------------------------------------------------------

async function generateDataset(db, catalogSize) {
  const metrics = Metrics.zero();
  const createdAt = new Date();

  // Calculates the number of chunks in which the catalog should be divided
  const numberOfChunks = Math.ceil(catalogSize / chunkSize);
  writeCsvHeaders(catalogDeleteFile);

  for (let chunkIndex = 0; chunkIndex < numberOfChunks; chunkIndex++) {
    const newFileName = `${fileName}-${chunkIndex}${fileExtension}`;
    writeCsvHeaders(newFileName);

    const maxSize = catalogSize <= chunkSize ? catalogSize : chunkSize;
    let products = [];

    for (let i = 0; i < maxSize; i++) {
      products.push(generateProduct(i, createdAt));
    }

    await db.collection('Products').insertMany(products, { ordered: true });

    let percent = 10;

    // For each inserted product, generate an update and determine whereas the produc should be added, updated or deleted.
    for await (const [index, item] of products.entries()) {
      const globalIndex = chunkIndex * chunkSize + index;
      const updatedProduct = generateUpdate(item, globalIndex, catalogSize);

      if (updatedProduct === null) {
        // If the product is to be deleted and exists in database, it will be pushed in to a specifiec .csv file.
        const productInDatabase = await db.collection('Products').findOne({ _id: item._id });
        productInDatabase && writeProductUpdateToCsv(catalogDeleteFile, item, item);
      }

      const progressPercentage = Math.ceil(globalIndex * 100 / catalogSize);

      if (progressPercentage !== percent) {
        if ((progressPercentage) % 10 === 0) {
          console.debug(`[DEBUG] Processing ${progressPercentage}%...`);
          percent = progressPercentage;
        }
      }
  
      metrics.merge(writeProductUpdateToCsv(newFileName, item, updatedProduct));
    }
  }

  logMetrics(catalogSize, metrics);
}

// -----------------------------------------------------------------------------------------------------
// @ CSV Management
// -----------------------------------------------------------------------------------------------------

function writeCsvHeaders(newFileName) {
  fs.writeFile(newFileName, '', () => {
    fs.appendFile(newFileName, Object.keys(generateProduct(-1, null)).join(',') + '\n', () => {});
  });
}

function writeProductUpdateToCsv(newFileName, product, updatedProduct) {
  if (updatedProduct) {
    if (updatedProduct._id === product._id) {
      // Updated product or no modification => add this line
      fs.appendFileSync(newFileName, updatedProduct.toCsv() + '\n');
      return updatedProduct.updatedAt !== updatedProduct.createdAt ? Metrics.updated() : Metrics.zero();
    } else {
      // keep product
      fs.appendFileSync(newFileName, product.toCsv() + '\n');
      // add new product
      fs.appendFileSync(newFileName, updatedProduct.toCsv() + '\n');
      return Metrics.added();
    }
  } else {
    return Metrics.deleted();
  }
}

// -----------------------------------------------------------------------------------------------------
// @ Products Management
// -----------------------------------------------------------------------------------------------------

function generateProduct(index, createdAt) {
  return new Product(uuidv4(), `Product_${index}`, generatePrice(), createdAt, createdAt);
}

function generatePrice() {
  return Math.round(Math.random() * 1000 * 100) / 100;
}

const productEvent = {
  pDelete: 10, // probability of deleting the product
  pUpdate: 10, // probability of updating the product
  pAdd: 20, // probability of adding a new product
};

function generateUpdate(product, index, catalogSize) {
  const rand = Math.random() * 100; // float in [0; 100]

  if (rand < productEvent.pDelete) { // [0; pDelete[
    // Delete product
    return null;
  }

  if (rand < productEvent.pDelete + productEvent.pUpdate) { // [pDelete; pUpdate[
    // Update product
    return new Product(product._id, `Product_${index + catalogSize}`, generatePrice(), product.createdAt, new Date());
  }

  if (rand < productEvent.pDelete + productEvent.pUpdate + productEvent.pAdd) { // [pUpdate; pAdd[
    // Add new product
    return generateProduct(index + catalogSize, new Date());
  }

  // Unchanged product
  return product; // [pAdd; 100]
}

// -----------------------------------------------------------------------------------------------------
// @ Utils
// -----------------------------------------------------------------------------------------------------

function logMetrics(catalogSize, metrics) {
  console.info(`[INFO] ${catalogSize} products inserted in DB.`);
  console.info(`[INFO] ${metrics.addedCount} products to be added.`);
  console.info(`[INFO] ${metrics.updatedCount} products to be updated ${(metrics.updatedCount * 100  /catalogSize).toFixed(2)}%.`);
  console.info(`[INFO] ${metrics.deletedCount} products to be deleted ${(metrics.deletedCount * 100 / catalogSize).toFixed(2)}%.`);
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