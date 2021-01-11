const express = require('express');
const path = require('path');
const { read, write, createError } = require('../utils');

const wishesDbPath = path.join(__dirname, '../db/wishes.json');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { present } = req.query;
    const wishes = await read(wishesDbPath);

    if (present) {
      const filteredWishes = wishes.filter((wish) =>
        wish.presents.includes(present) ? wish : false
      );
      if (!filteredWishes.length > 0) {
        createError('That type of present does not exist', 404);
      }
      res.status(200).json({
        data: {
          wishes: filteredWishes,
        },
        status: 'ok',
      });
    }

    res.status(200).json({
      data: {
        wishes,
      },
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:name', async (req, res, next) => {
  try {
    const name = req.params.name.toLowerCase();
    const wishes = await read(wishesDbPath);
    const unique = wishes.filter((wish) => wish.name.toLowerCase() === name);
    if (!unique.length > 0) {
      createError('No kid with that name', 404);
    }
    res.status(200).json({
      data: {
        wish: unique,
      },
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
