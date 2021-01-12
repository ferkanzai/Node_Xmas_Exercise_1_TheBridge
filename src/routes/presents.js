const express = require('express');
const path = require('path');
const { read, write, createError } = require('../utils');

const wishesDbPath = path.join(__dirname, '../db/wishes.json');
const presentsDbPath = path.join(__dirname, '../db/presents.json');
const scoresDbPath = path.join(__dirname, '../db/scores.json');
const pricesDbPath = path.join(__dirname, '../db/prices.json');

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

router.put('/money/:name', async (req, res, next) => {
  try {
    const name = req.params.name.toLowerCase();
    const presentsList = await read(presentsDbPath);
    const presentFiltered = presentsList.filter((kid) => kid.name.toLowerCase() === name);
    const presentsForKid = presentFiltered[0].presents;
    const wishesKid = await read(wishesDbPath);
    const wishesFiltered = wishesKid.filter((kid) => kid.name.toLowerCase() === name)[0];
    const scoresKid = await read(scoresDbPath);
    const scoresFiltered = scoresKid.filter((kid) => kid.name.toLowerCase() === name)[0];
    const pricesList = await read(pricesDbPath);

    const presentsForKidPrices = presentsForKid.reduce((acc, next) => {
      let priceToAdd = {};
      if (next !== 'coal') {
        priceToAdd = pricesList.filter((el) => el.present === next)[0];
      } else {
        priceToAdd = {
          present: 'coal',
          price: 0,
        };
      }
      return [...acc, priceToAdd];
    }, []);

    console.log(presentsForKidPrices);

    const totalMoney = presentsForKidPrices.reduce((acc, next) => acc + next.price, 0);

    console.log(totalMoney);

    if (!presentFiltered.length > 0) {
      createError('No kid with that name', 404);
    }

    let presentsToWrite = [];
    let moneyToSpend = 0;

    if (scoresFiltered.score > 8) {
      moneyToSpend = 7000;
      presentsToWrite = wishesFiltered.presents;
    } else if (scoresFiltered.score < 5) {
      moneyToSpend = 300;
      presentsToWrite = [wishesFiltered.presents[0], 'coal'];
    } else if (scoresFiltered.score >= 5 || scoresFiltered.score <= 8) {
      moneyToSpend = 2000;
      presentsToWrite = [...wishesFiltered.presents, 'coal'];
    }
  } catch (error) {
    next(error);
  }
});

router.put('/:name', async (req, res, next) => {
  try {
    const name = req.params.name.toLowerCase();
    const presentsList = await read(presentsDbPath);
    const presentFiltered = presentsList.filter((kid) => kid.name.toLowerCase() === name);
    const wishesKid = await read(wishesDbPath);
    const wishesFiltered = wishesKid.filter((kid) => kid.name.toLowerCase() === name)[0];
    const scoresKid = await read(scoresDbPath);
    const scoresFiltered = scoresKid.filter((kid) => kid.name.toLowerCase() === name)[0];

    if (!presentFiltered.length > 0) {
      createError('No kid with that name', 404);
    }

    if (presentFiltered[0].presents.length !== 0) {
      createError('This kid has presents already!!', 409);
    }

    let presentsToWrite = [];

    if (scoresFiltered.score > 7) {
      presentsToWrite = wishesFiltered.presents;
    } else if (scoresFiltered.score < 5) {
      presentsToWrite = [wishesFiltered.presents[0], 'coal'];
    } else if (scoresFiltered.score >= 5 || scoresFiltered.score <= 7) {
      presentsToWrite = [...wishesFiltered.presents, 'coal'];
    }

    console.log(presentsToWrite);

    presentFiltered[0].presents = presentsToWrite;

    const toWrite = presentsList.map((el) => {
      if (el.name === name) {
        el = presentFiltered[0];
      }
      return el;
    });

    await write(presentsDbPath, JSON.stringify(toWrite, null, 2));

    res.status(200).json({
      data: {
        newData: presentFiltered[0],
      },
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
