const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');

const appRouter = require('./routes');

const app = express();

const configApp = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(morgan('combined'));
  app.use(helmet());

  app.use('/', appRouter);

  app.use((error, req, res, next) => {
    console.log(error);
    res.status(error.code || 500).json({
      status: 'no ok',
      info: {
        error,
        message: error.message,
      },
    });
  });

  return app;
};

module.exports = configApp(app);