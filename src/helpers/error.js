module.exports = error => {
  if (error) {
    if (error.stack) {
      console.log(error.stack);
    }

    throw error;
  }
};