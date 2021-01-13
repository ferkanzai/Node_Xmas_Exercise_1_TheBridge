const express = require('express');
const { restart } = require('nodemon');
const path = require('path');
const { read, write, createError, checkPresentsForMoney } = require('../utils');

const wishesDbPath = path.join(__dirname, '../db/wishes.json');
const presentsDbPath = path.join(__dirname, '../db/presents.json');
const scoresDbPath = path.join(__dirname, '../db/scores.json');
const pricesDbPath = path.join(__dirname, '../db/prices.json');

function sortPrice(a, b) {
  if (a.price < b.price) {
    return -1;
  }
  if (a.price > b.price) {
    return 1;
  }
  return 0;
}

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const presentsList = await read(presentsDbPath);

    res.status(200).json({
      data: {
        presentsList,
      },
      status: 'ok',
    });
  } catch (error) {
    next(error);
    return;
  }
});

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
    return;
  }
});

router.put('/money/:name', async (req, res, next) => {
  try {
    const name = req.params.name.toLowerCase();
    const presentsList = await read(presentsDbPath);
    const presentFiltered = presentsList.filter((kid) => kid.name.toLowerCase() === name);
    const presentsForKid = presentFiltered[0].presents;
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

    const sorted = presentsForKidPrices.sort(sortPrice);

    if (!presentFiltered.length > 0) {
      createError('No kid with that name', 404);
    }

    let presentsToWrite = [];
    let moneyToSpend = 0;

    if (scoresFiltered.score > 8) {
      moneyToSpend = 7000;
      presentsToWrite = checkPresentsForMoney(sorted, moneyToSpend);
    } else if (scoresFiltered.score < 5) {
      moneyToSpend = 300;
      presentsToWrite = checkPresentsForMoney(sorted, moneyToSpend);
    } else if (scoresFiltered.score >= 5 || scoresFiltered.score <= 8) {
      moneyToSpend = 2000;
      presentsToWrite = checkPresentsForMoney(sorted, moneyToSpend);
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
    return;
  }
});

router.put('/add/:name', async (req, res, next) => {
  try {
    const name = req.params.name.toLowerCase();
    const { present } = req.body;
    console.log(req.body)
    const presentsList = await read(presentsDbPath);
    const presentFiltered = presentsList.filter((kid) => kid.name.toLowerCase() === name);

    presentFiltered[0].presents.push(present);

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
    return;
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
      return;
    }

    if (presentFiltered[0].presents.length !== 0) {
      createError('This kid has presents already!!', 409);
      return;
    }

    let presentsToWrite = [];

    if (scoresFiltered.score > 7) {
      presentsToWrite = wishesFiltered.presents;
    } else if (scoresFiltered.score < 5) {
      presentsToWrite = [wishesFiltered.presents[0], 'coal'];
    } else if (scoresFiltered.score >= 5 || scoresFiltered.score <= 7) {
      presentsToWrite = [...wishesFiltered.presents, 'coal'];
    }

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
    return;
  }
});

router.delete('/:name', async (req, res, next) => {
  try {
    const name = req.params.name.toLowerCase();
    const presentsList = await read(presentsDbPath);
    const presentFiltered = presentsList.filter((kid) => kid.name.toLowerCase() !== name);

    if (presentFiltered.length === presentsList.length) {
      createError('No kid with that name', 404);
      return;
    }

    await write(presentsDbPath, JSON.stringify(presentFiltered, null, 2));

    res.status(200).json({
      data: {
        newData: presentFiltered,
      },
      status: 'ok',
    });
  } catch (error) {
    next(error);
    return;
  }
});

module.exports = router;
