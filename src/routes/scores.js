const express = require('express');
const path = require('path');
const { read, write, createError } = require('../utils');

const scoresDbPath = path.join(__dirname, '../db/scores.json');

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const scores = await read(scoresDbPath)
    res.status(200).json({
      data: {
        scores
      },
      status: 'ok'
    })
  }
  catch (error) {
    next(error);
  }
})

router.get('/:name', async (req, res, next) => {
  try {
    const name = req.params.name.toLowerCase()
    const scores = await read(scoresDbPath)
    const unique = scores.filter((score) => score.name.toLowerCase() === name)
    if (!unique.length > 0) {
      createError('No kid with that name', 404)
    }
    res.status(200).json({
      data: {
        unique
      },
      status: 'ok'
    })
  } catch (error) {
    next(error);
  }
})

module.exports = router;