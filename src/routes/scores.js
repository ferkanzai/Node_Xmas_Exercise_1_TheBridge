const express = require('express');
const path = require('path');
const { read, write, createError } = require('../utils');

const scoresDbPath = path.join(__dirname, '../db/scores.json');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { score } = req.query;
    const scoresList = await read(scoresDbPath);

    if (score) {
      const filteredScores = scoresList.filter((scoresList) =>
        scoresList.score > Number(score) ? score : false
      );
      if (!filteredScores.length > 0) {
        createError(`Nobody has more score than ${score}`, 404);
        return;
      }
      res.status(200).json({
        data: {
          scores: filteredScores,
        },
        status: 'ok',
      });
      return;
    }

    res.status(200).json({
      data: {
        scoresList,
      },
      status: 'ok',
    });
  } catch (error) {
    next(error);
    return;
  }
});

router.get('/:score', async (req, res, next) => {
  try {
    const name = req.params.name.toLowerCase();
    const scores = await read(scoresDbPath);
    const unique = scores.filter((score) => score.name.toLowerCase() === name);
    if (!unique.length > 0) {
      createError('No kid with that name', 404);
      return;
    }
    res.status(200).json({
      data: {
        score: unique,
      },
      status: 'ok',
    });
  } catch (error) {
    next(error);
    return;
  }
});

module.exports = router;
