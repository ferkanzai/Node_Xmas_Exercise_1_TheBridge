const express = require('express');
const path = require('path');
const { read, write, createError } = require('../utils');

const wishesDbPath = path.join(__dirname, '../db/wishes.json');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const wishesList = await read(wishesDbPath);

    const toWrite = wishesList.map((wish) => ({
      name: wish.name,
      presents: [],
    }));
    await write(path.join(__dirname, '../db/presents.json'), toWrite);

    res.status(200).json({
      data: 'file written',
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
