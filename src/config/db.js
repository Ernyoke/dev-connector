const mongoose = require('mongoose');
const config = require('config');
const chalk = require('chalk');
const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    });
    console.log(chalk.greenBright('MongoDB connected...'));
  } catch (err) {
    console.error(chalk.red(err.message));
    process.exit(1);
  }
};

module.exports = connectDB;
