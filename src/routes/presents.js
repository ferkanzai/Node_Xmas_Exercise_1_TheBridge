const express = require('express');
const path = require('path');
const { read, write, createError } = require('../utils');

const wishesDbPath = path.join(__dirname, '../db/wishes.json');
const presentsDbPath = path.join(__dirname, '../db/presents.json');
const scoresDbPath = path.join(__dirname, '../db/scores.json');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const wishesList = await read(wishesDbPath);

    const toWrite = wishesList.map((wish) => ({
      name: wish.name,
      presents: [],
    }));
    await write(path.join(__dirname, '../db/presents.json'), JSON.stringify(toWrite, null, 2));

    res.status(200).json({
      data: 'file written',
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:name', async (req, res, next) => {
  try {
    const name = req.params.name.toLowerCase();
    const presents = await read(presentsDbPath);
    const presentsKid = await read(presentsDbPath);
    const presentFiltered = presentsKid.filter((kid) => kid.name.toLowerCase() === name);
    const wishesKid = await read(wishesDbPath);
    const wishesFiltered = wishesKid.filter((kid) => kid.name.toLowerCase() === name);
    const scoresKid = await read(scoresDbPath);
    const scoresFiltered = scoresKid.filter((kid) => kid.name.toLowerCase() === name);

    console.log(presentFiltered);
    console.log(wishesFiltered);
    console.log(scoresFiltered);

    if (scoresKid.score > 7) {
      console.log(true)
      const toWrite = presents.map((present) => {
        if (present.name.toLowerCase() === name) {
          present.presents = wishesFiltered.presents;
        }
        return present;
      });
      await write(presentsDbPath, toWrite);
    }

    res.status(200).json({
      data: {
        toWrite,
      },
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
