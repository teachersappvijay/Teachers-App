const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.error(err.name, err.message);
  console.error('Uncaught exception, shutting down');

  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

let server;

mongoose.connect(DB).then(() => {
  console.log('DB connection successful');
  server = app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
  });
});

process.on('unhandledRejection', (err) => {
  console.error(err);

  console.log(err.name, err.message);
  console.log('Unhandled rejection, shutting down');
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
});
