const { check, validationResult } = require('express-validator');
const { categories } = require('./categoriesHelper');
//  const {ObjectId} = require('mongoose').Types;

function checkValidationResult(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
  } else {
    next();
  }
}
exports.checkValidationResult = checkValidationResult;
/*
exports.validateJSON = [check().isJSON(), checkValidationResult];
*/


exports.postQuestion = [
  check('author')
    .not()
    .isEmpty()
    .withMessage('Your Q&A must have a author.'),
  check('name')
    .not()
    .isEmpty()
    .withMessage('Your Q&A must have a name.')
    .isLength({ min: 5 })
    .withMessage('Your Q&A must have a name at least five characters long.'),
  check('category')
    .not()
    .isEmpty()
    .withMessage('Your Q&A must have category.')
    .custom((value) => {
      let num = 0;
      categories.forEach((category) => {
        if (category.name === value) num += 1;
      });
      if (num < 1) {
        throw new Error(`Your category ${value} is wrong，`);
      } return true;
    }),
  check('question.question')
    .not()
    .isEmpty()
    .withMessage('Your Q&A must have question.')
    .isLength({ min: 5 })
    .withMessage('Your Q&A must have a question content at least five characters long.'),
  check('question.answers.*.answer')
    .not()
    .isEmpty()
    .withMessage('Your Q&A must have an answer for each answer.'),
  check('question.answers.*.correct')
    .not()
    .isEmpty()
    .withMessage('Your Q&A must have an correct tag for each answer.'),
  check('question.answers.*.explanation')
    .not()
    .isEmpty()
    .withMessage('Your Q&A must have an explanation for each answer.'),
  check('question.answers')
    .custom((value) => {
      if (value.length < 2) {
        throw new Error('Your Q&A must have 2 answers.');
      } return true;
    })
    .custom((value) => {
      let num = 0;
      value.forEach((item) => {
        if (item.correct === true) num += 1;
      });
      if (num !== 1) {
        throw new Error(`Your Q&A must have 1 correct answer, but now you have ${num}.`);
      } return true;
    }),
];

// exports.putQuestion = [
//   check('id')
//     .optional()
//     .isMongoId()
//     .withMessage('This is not a correct id'),
//   check('author')
//     .optional()
//     .isString()
//     .withMessage('Your author name must be a String.')
//     .unescape(),
//   check('name')
//     .optional()
//     .isString()
//     .withMessage('Your question name must be a String.')
//     .isLength({ min: 5 })
//     .withMessage('Your Q&A must have a name at least five characters long.')
//     .unescape(),
//   check('category')
//     .optional()
//     .isString()
//     .withMessage('Your category must be a String.')
//     .unescape(),
// ];

exports.getQuestions = [
  check('id')
    .optional()
    .isMongoId()
    .withMessage('This is not a correct id'),
];

exports.deleteQuestions = [
  check('id')
    .optional()
    .isMongoId()
    .withMessage('This is not a correct id'),
];

// exports.checkValidationResult = checkValidationResult;
