/* eslint-disable no-console */
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const paginate = require('express-paginate');
const {
  check,
  validationResult,
} = require('express-validator');
const sanitize = require('./sanitize');
const validate = require('./validate');
const mongodb = require('./mongoDBFunction');
const {asyncFunction} = require('./asyncFunction');

// const jsonParser = bodyParser.json();
const app = express();
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

app.use(generalLimiter);
app.use(helmet());
const corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true,
  enablePreflight: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.json());
app.use(paginate.middleware(10, 50));

//  app.use(bodyParser.urlencoded({ extended: true }));

// find questions by name
// find quesions by category

//  app.get('/questions/:id', mongodb.findQuestionById);

// app.get('/categories', (req, res) => {
//   res.status(200).json({
//     message: 'Successfully get categories.',
//     categories,
//   });
// });


app.get('/categories', asyncFunction(async (req, res, next) => categories.getCategoryNames(req, res, next)));
/*
app.post('/questions', async (req, res, next) => {
  console.log('here');
  await check('category')
    .isLength({ min: 5 })
    .withMessage('Category must be at least five characters long.')
    .run(req);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({ errors: result.array() });
  }
  return mongodb.insertQuestion(req, res);
});
*/

/*
app.get('/questions',
  validate.getQuestions,
  validate.checkValidationResult,
  (req, res) => {
    if (req.query.name) {
      return mongodb.findQuestionByName(req, res);
    }
    if (req.query.category) {
      return mongodb.findQuestionByCategory(req, res);
    }
    if (req.query.id) {
      return mongodb.findQuestionById(req, res);
    }
    return mongodb.getQuestions(req, res);
  });

app.delete('/questions',
  validate.deleteQuestions,
  validate.checkValidationResult, (req, res) => {
    if (req.query.id) {
      return mongodb.deleteQuestionById(req, res);
    }
    return mongodb.deleteQuestion(res);
  });
*/
app.post(
  '/questions',
  validate.getQuestions,
  validate.checkValidationResult,
  sanitize.postQuestion,
  (req, res) => {
    if (req.query.id) {
      return mongodb.updateQuestionById(req, res);
    }
    return res.status(422).json({ errors: ['You should give a specific condition to find resources.'] });
  },
);

app.get(
  '/questions/:id',
  validate.getQuestions,
  validate.checkValidationResult,
  (req, res) => mongodb.findQuestionById(req, res),
);

app.delete(
  '/questions',
  validate.deleteQuestions,
  validate.checkValidationResult,
  (req, res) => {
    if (req.query.id) {
      return mongodb.deleteQuestionById(req, res);
    }
    return mongodb.deleteQuestion(res);
  },
);

// app.post(
//   '/questions',
//   validate.postQuestion,
//   validate.checkValidationResult,
//   sanitize.postQuestion,
//   (req, res) => {
//     mongodb.insertQuestion(req, res);
//   },
// );

app.post('/questions', async (req, res) => {
  await check('category')
    .not()
    .isEmpty()
    .isLength({ min: 20 })
    .withMessage(
      'Your Q&A must have a question content at least five characters long.',
    )
    .run(req);

  const result = await validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({ errors: result.array() });
  }
  return mongodb.insertQuestion(req, res);
  // user can be created now!
});

app.put(
  '/questions',
  validate.postQuestion,
  validate.checkValidationResult,
  sanitize.postQuestion,
  (req, res) => {
    if (req.query.id) {
      return mongodb.updateQuestionById(req, res);
    }
    return res
      .status(422)
      .json({
        errors: ['You shoule give a specific conditon to find resources.'],
      });
  },
);

app.listen(3000);
console.log('listening to port 3000');

/*
app.all('*', (req, res) => {
  res.status(404).json({ errors: ['Resource not found.'] });
});
app.use((req, res) => {
  res.status(500).json({ errors: ['An unknown error occurred.'] });
});
*/
