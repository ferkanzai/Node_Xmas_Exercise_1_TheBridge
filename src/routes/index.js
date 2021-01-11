const express = require('express');

const wishesRouter = require('./wishes');
const scoresRouter = require('./scores');
const presentsRouter = require('./presents');

const router = express.Router();

router.use('/wishes', wishesRouter);
router.use('/scores', scoresRouter);
router.use('/presents', presentsRouter);

module.exports = router;
