
const express = require('express');
const router = express.Router();
const controller = require('../controllers/mediaController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/movies', authMiddleware, controller.listMovies);
router.get('/series', authMiddleware, controller.listSeries);
router.get('/movies/:id', authMiddleware, controller.getMovie);
router.get('/series/:id/episodes', authMiddleware, controller.getSeriesEpisodes);
router.get('/movies/:id/stream', authMiddleware, controller.streamMovie);
router.get('/episodes/:id/stream', authMiddleware, controller.streamEpisode);

module.exports = router;
