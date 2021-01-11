const express = require('express');
const path = require('path');
const { read, write, createError } = require('../utils');

const wishedDbPath = path.join(__dirname, '../db/wishes.json');

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const wishes = await read(wishedDbPath)
    res.status(200).json({
      data: wishes
    })
  }
  catch (error) {
    console.log(err)
    res.send('error')
  }
})

module.exports = router;