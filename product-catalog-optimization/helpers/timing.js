async function timing(label, callable) {
  console.time(`INFO: ${label}`);
  try {
    return await callable();
  } finally {
    console.timeEnd(`INFO: ${label}`);
  }
}

module.exports = {
  timing,
};
