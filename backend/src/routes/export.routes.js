const { Router } = require('express');
const exportController = require('../controllers/export.controller');
const authenticate = require('../middleware/auth.middleware');

const router = Router();

router.use(authenticate);

router.get('/', exportController.exportEvents);

module.exports = router;
