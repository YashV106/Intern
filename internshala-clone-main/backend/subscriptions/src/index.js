const express = require('express');
const subscriptionRoutes = require('./routes');

const router = express.Router();

router.use('/', subscriptionRoutes);

module.exports = router;
