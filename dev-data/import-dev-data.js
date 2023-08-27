const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: `${__dirname}/../config.env` });

const Tour = require('../models/tourModel');

console.log(process.env.DATABASE);

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(con => {
    console.log('connected to the database');
  });

const tours = fs.readFileSync(
  `${__dirname}/data/tours-simple.json`,
  'utf-8',
  (err, data) => {
    console.log(data);
  }
);

// importing data to database

const importDataToDatabase = async () => {
  try {
    await Tour.create(JSON.parse(tours));
    console.log('data imported successfully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// delete all data from database

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data successfully deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importDataToDatabase();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
