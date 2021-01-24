const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

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

// starting server

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});
