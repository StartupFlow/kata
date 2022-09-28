# Test: Product Catalog Optimization
We want to simulate a product catalog contained in a database, which is updated with a csv.

This repository contains two scripts: `generate-dataset.js` and `update-catalog.js`.

`generate-dataset.js` creates an initial product catalog in the MongoDB database, along with a `updated-catalog.csv` file. The `csv` file contains the new version of the catalog.

The `update-catalog.js` script updates the product catalog in MongoDB from the `updated-catalog.csv` file. Products can be added, updated, or removed from the catalog.

## Setup
1. Fork this repository
1. Clone it
1. run `npm install`

### Start a MongoDB instance
Using docker:
```bash
docker run -p 27017:27017 mongo:latest
```
Or you can install a MongoDB by yourself https://www.mongodb.com/docs/manual/installation/

### Run the code on a small dataset
You can run one of these commands to generate the initial product catalog and the update file:
```bash
node generate-dataset.js --size=100
```
or
```bash
npm run generate:S
```
Then, to update the catalog from the `csv` file:
```bash
node update-catalog.js
```
or
```bash
npm run update
```

## Your job
The current implementation has poor performance. We want you to optimize both scripts to gain several orders of magnitude: 1000, 10000, 100000, 1000000...

You can run the `generate-dataset.js` script with various `size` values or use the `npm` scripts:
```JSON
// package.json abstract
{
  "scripts": {
    "generate:S": "node generate-dataset.js --size=100",
    "generate:M": "node generate-dataset.js --size=10000",
    "generate:L": "node generate-dataset.js --size=100000",
    "generate:XL": "node generate-dataset.js --size=1000000",
    "update": "node update-catalog.js",
  },
}
```

We're interested in how you find the parts of the code that should be optimized and in the trade-off you make. We'll discuss this during the debrief. This exercise should take less than 2 hours.
