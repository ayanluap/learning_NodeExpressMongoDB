const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../model/tourModel');

dotenv.config({ path: './config.env' });

// Connecting with DB (using mongoose)
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB Connected Succcesfully!'));

// copy json file to DB
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`));

// Copy data to DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data Loaded');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Delete All data from collection/table
const delData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Collection is Empty now!!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  delData();
}
