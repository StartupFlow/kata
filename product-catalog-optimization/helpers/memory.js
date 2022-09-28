const _ = require('lodash');

const { prettyBytes } = require('./pretty-bytes');

async function memory(label, callable) {
  const initialMemoryMetrics = memUsage();
  try {
    return await callable();
  } finally {
    const finalMemoryMetrics = memUsage();

    const delta = {
      rss: finalMemoryMetrics.rss - initialMemoryMetrics.rss,
      heapTotal: finalMemoryMetrics.heapTotal - initialMemoryMetrics.heapTotal,
      heapUsed: finalMemoryMetrics.heapUsed - initialMemoryMetrics.heapUsed,
      external: finalMemoryMetrics.external - initialMemoryMetrics.external,
      arrayBuffers:
        finalMemoryMetrics.arrayBuffers - initialMemoryMetrics.arrayBuffers,
    };

    console.debug(
      `DEBUG: ${label} - delta memory metrics:`,
      _.mapValues(delta, prettyBytes),
    );
  }
}

function memUsage() {
  const metrics = process.memoryUsage();
  pushMemoryUsageDataPoint(metrics);
  return metrics;
}

const stats = {
  max: {
    rss: 0,
    heapTotal: 0,
    heapUsed: 0,
    external: 0,
    arrayBuffers: 0,
  },
  sum: {
    rss: 0,
    heapTotal: 0,
    heapUsed: 0,
    external: 0,
    arrayBuffers: 0,
  },
  count: 0,
};
function pushMemoryUsageDataPoint(metrics) {
  stats.max.rss = Math.max(stats.max.rss, metrics.rss);
  stats.max.heapTotal = Math.max(stats.max.heapTotal, metrics.heapTotal);
  stats.max.heapUsed = Math.max(stats.max.heapUsed, metrics.heapUsed);
  stats.max.external = Math.max(stats.max.external, metrics.external);
  stats.max.arrayBuffers = Math.max(
    stats.max.arrayBuffers,
    metrics.arrayBuffers,
  );

  stats.sum.rss = stats.sum.rss + metrics.rss;
  stats.sum.heapTotal = stats.sum.heapTotal + metrics.heapTotal;
  stats.sum.heapUsed = stats.sum.heapUsed + metrics.heapUsed;
  stats.sum.external = stats.sum.external + metrics.external;
  stats.sum.arrayBuffers = stats.sum.arrayBuffers + metrics.arrayBuffers;

  stats.count += 1;
}

function getMemoryStatistics() {
  return {
    max: _.mapValues(stats.max, prettyBytes),
    datapointCount: stats.count,
    average: {
      rss: prettyBytes(stats.sum.rss / stats.count),
      heapTotal: prettyBytes(stats.sum.heapTotal / stats.count),
      heapUsed: prettyBytes(stats.sum.heapUsed / stats.count),
      external: prettyBytes(stats.sum.external / stats.count),
      arrayBuffers: prettyBytes(stats.sum.arrayBuffers / stats.count),
    },
  };
}

module.exports = {
  memory,
  getMemoryStatistics,
};
