const { check, validationResult } = require('express-validator');
const { getCategoriesNames } = require('../data/categoriesData');
const { ValidationError } = require('./validationError');

module.exports.postQuestion = async function postQuestion(req) {
  try {
    Promise.all([
      await check('author')
        .not()
        .isEmpty()
        .withMessage('Your Q&A must have a author.')
        .escape()
        .run(req),
      await check('category')
        .not()
        .isEmpty()
        .withMessage('Your Q&A must have category.')
        .custom(async value => {
          try {
            const result = await getCategoriesNames();
            if (result.indexOf(value) === -1) {
              throw new Error(`Your category ${value} is not a valid category，`);
            }
            return true;
          } catch (error) {
            throw error;
          }
        })
        .withMessage('Your Q&A must be letters only.')
        .escape()
        .run(req),
      await check('question')
        .not()
        .isEmpty()
        .withMessage('Your Q&A must have question.')
        .isLength({
          min: 5
        })
        .withMessage('Your Q&A must have a question content at least five characters long.')
        .run(req),
      await check('answers.*.answer')
        .not()
        .isEmpty()
        .withMessage('Your Q&A must have an answer for each answer.')
        .run(req),
      await check('answers.*.correct')
        .isBoolean()
        .withMessage('Each answer in your Q&A must be true or false.')
        .run(req),
      await check('answers.*.explanation')
        .not()
        .isEmpty()
        .withMessage('Your Q&A must have an explanation for each answer.')
        .run(req),
      await check('answers')
        .custom(value => {
          if (value.length < 2 || value.length > 5) {
            throw new Error('Your Q&A must have 2–5 answers.');
          }
          return true;
        })
        .custom(value => {
          let num = 0;
          value.forEach(item => {
            if (item.correct === true) num += 1;
          });
          if (num !== 1) {
            throw new Error(`Your Q&A must have 1 correct answer, but now you have ${num}.`);
          }
          return true;
        })
        .run(req)
    ])
      .then(async () => {
        try {
          console.log('postQuestion rues have run');
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            console.log('there are errors');
            throw ValidationError(errors.array());
          }
          return true;
        } catch (error) {
          throw error;
        }
      })
      .catch(error => {
        console.log('was error', error);
        throw error;
      });
  } catch (error) {
    console.log('postQuestion validator error', JSON.stringify(error));
    throw error;
  }
};

module.exports.getQuestions = async function getQuestions(req) {
  await check('id')
    .optional()
    .isMongoId()
    .withMessage('This is not a correct id')
    .run(req);
  await check('category')
    .escape()
    .run(req);

  const errors = await validationResult(req);
};

// exports.getQuestions = [
//   check('id')
//     .optional()
//     .isMongoId()
//     .withMessage('This is not a correct id'),
//   check('category')
//     .escape(),
// ];

module.exports.deleteQuestions = async function deleteQuestions(req) {
  await check('id')
    .optional()
    .isMongoId()
    .withMessage('This is not a correct id')
    .run(req);

  await validationResult(req);
};

// exports.deleteQuestions = [
//   check('id')
//     .optional()
//     .isMongoId()
//     .withMessage('This is not a correct id'),
// ];

// exports.checkValidationResult = checkValidationResult;
