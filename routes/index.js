const express = require('express');
const { categoriesController, questionsController } = require('../controllers');

const router = express.Router();

const { FileNotFoundError } = require('../errors');

module.exports = router;

router.get('/categories', categoriesController.getCategories);

router.get('/questions', questionsController.getQuestions);

router.get('/questions/:id', async function handler(req, res, next) {
  try {
    questionsController.getQuestions(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.post('/questions', async function handler(req, res, next) {
  try {
    questionsController.postQuestion(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.delete('/questions', questionsController.deleteQuestions);

/*
router.use((req, res) => {
  console.log('everything worked!', res.body);
  res.status(200).send({ res });
});

router.use((error, req, res, next) => {
  if (error instanceof MongoError) {
    res.status(503).json({
      type: 'MongoError',
      message: error.message
    });
  }
  next(error);
});


*/

router.all('*', (req, res) => {
  const error = new FileNotFoundError();
  res.status(404).json({ error });
});

router.use((req, res) => {
  res.status(500).json({ errors: ['An unknown error occurred.'] });
});

router.use((err, req, res, next) => {
  console.log('`MESSAGE: ', err.message);
  const error = err;
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  res.status(err.statusCode).send({ errors: error });
  next();
});
