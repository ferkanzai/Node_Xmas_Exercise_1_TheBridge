const express = require('express')

const wishesRouter = require('./wishes')
const scoresRouter = require('./scores')

const router = express.Router()

router.use('/wishes', wishesRouter)
router.use('/scores', scoresRouter)

module.exports = router;