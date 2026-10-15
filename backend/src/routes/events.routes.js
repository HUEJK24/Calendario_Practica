const { Router } = require('express');
const eventsController = require('../controllers/events.controller');
const authenticate = require('../middleware/auth.middleware');

const router = Router();

// Todas las rutas de eventos exigen un JWT válido.
router.use(authenticate);

router.get('/', eventsController.list);
router.get('/:id', eventsController.getOne);
router.post('/', eventsController.create);
router.put('/:id', eventsController.update);
router.delete('/:id', eventsController.remove);

module.exports = router;
