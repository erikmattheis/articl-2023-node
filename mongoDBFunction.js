/* eslint-disable no-console */
const mongoose = require('mongoose');
const paginate = require('express-paginate');

//  local
//  const url = 'mongodb://127.0.0.1:27017/myTest';

//  remote
const url = 'mongodb+srv://root:root@cluster0-jl94d.gcp.mongodb.net/articleDatabase?retryWrites=true&w=majority';

mongoose.connect(url, {
  useNewUrlParser: true,
  config: { autoIndex: false },
});
mongoose.set('useFindAndModify', false);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  // we're connected!
  console.log('MongoDB in mongoose is active.');
});

const categorySchema = new mongoose.Schema({
  term_id: Number,
  name: { type: String, index: true },
  slug: String,
  description: String,
  parent: Number,
  html_title: { type: String, index: true },
  category_image: String,
});

const Category = mongoose.model('Category', categorySchema);

const questionSchema = new mongoose.Schema({
  author: String,
  //  category: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Category' }],
  category: String,
  updated: String,
  createTime: String,
  question: {
    question: String,
    answers: [
      {
        answer: String,
        correct: Boolean,
        explanation: String,
      },
    ],
  },
});

const Question = mongoose.model('Question', questionSchema);

// //  insert JSON file
// Category.remove();
// const fileName = '/Users/yueyin/Desktop/category.json';
// console.log(`path：${fileName}`);
// const fileContent = fs.readFileSync(fileName);
// if (fileContent) {
//   console.log(`fileContent .len=${fileContent.length}`);
//   const categories = JSON.parse(fileContent);
//   const allItem = categories.categories;
//   Category.insertMany(allItem, (err) => {
//     if (err) throw err;
//     console.log('success');
//     db.close();
//   });
// }


async function insertQuestion(req, res) {
  const newQuestion = new Question({
    author: req.body.author,
    // //  category: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Category' }],
    category: req.body.category,
    updated: new Date(),
    createTime: new Date(),
    question: req.body.question,
  });
  // console.log(`dubug:${newQuestion}`);
  try {
    await newQuestion.save((err, result) => {
      if (err) {
        res
          .status(500)
          .json({ errors: err.mapped() });
      } else {
        res.status(201).json({
          message: 'Successfully insert question.',
          question: result,
        });
      }
    });
  } catch (e) {
    res.status(422).json({ errors: e.mapped() });
  }
}


async function findQuestionByAuthor(req, res) {
  console.log(`try to find: ${req.query.author}`);
  const regAuthor = RegExp(req.query.author, 'i');
  try {
    await Question
      .find({ name: { $regex: regAuthor } }, (err, result) => {
        if (err || result[0] === undefined) {
          res
            .status(500)
            .json({ errors: err.mapped() });
        } else {
          res.status(200).json({
            message: 'Successfully found question.',
            question: result,
          });
        }
      });
  } catch (e) {
    res.status(422).json({ errors: e.mapped() });
  }
}

async function findQuestionByCategory(req, res) {
  console.log(`try to find: ${req.query.category}`);
  const regCategory = RegExp(req.query.category, 'i');
  try {
    await Question
      .find({ category: { $regex: regCategory } }, (err, result) => {
        if (err || result[0] === undefined) {
          res
            .status(500)
            .json({ errors: err.mapped() });
        } else {
          res.status(200).json({
            message: 'Successfully found question.',
            question: result,
          });
        }
      });
  } catch (e) {
    return res.status(422).json({ errors: e.mapped() });
  }
}
async function findQuestionById(req, res) {
  try {
    await Question
      .find({ _id: req.params.id }, (err, result) => {
        if (err) {
          res.status(500).json({ err });
        } else {
          res.status(200).json({
            message: 'success',
            question: result,
          });
        }
      });
  } catch (e) {
    res.status(500).json({ e });
  }
}

//  http://localhost:3000/questions?page=1&limit=2&sort=name
//  http://localhost:3000/questions?page=1&limit=2&sort=createTime&order=1

async function getQuestions(req, res) {
  console.log('try to find all questions, sort by:', req.query.sort);
  try {
    const [results, itemCount] = await Promise.all([
      //  Question.find({}).limit(req.query.limit).skip(req.skip).sort({ updated: req.query.order })
      Question.find({}).limit(req.query.limit).skip(req.skip).sort(req.query.sort)
        .lean()
        .exec(),
      Question.count({}),
    ]);

    const pageCount = Math.ceil(itemCount / req.query.limit);
    if (req.accepts('json')) {
      res.status(200).json({
        message: 'Successfully found database.',
        has_more: paginate.hasNextPages(req)(pageCount),
        question: results,
      });
    }
  } catch (e) {
    res.status(500).json({ e });
  }
}

async function deleteQuestion(res) {
  console.log('try to delete all items in Question');
  try {
    await Question
      .remove({}, (err, result) => {
        if (err || !result) {
          res
            .status(500)
            .json({ errors: err.mapped() });
        }
        res.status(200).json({
          message: 'Successfully delete database.',
          question: result,
        });
      });
  } catch (e) {
    res.status(500).json({ e });
  }
}

async function deleteQuestionById(req, res) {
  console.log('try to delete a Question');
  try {
    await Question
      .remove({ _id: req.params.id }, (err, result) => {
        if (err || !result) {
          res.status(500).json({ errors: ['Failed to delete this question.'] });
          return true;
        }
        res.status(200).json({
          message: 'Successfully delete database.',
          question: result,
        });
        return false;
      });
  } catch (e) {
    res.status(500).json({ e });
  }
}

async function updateQuestionById(req, res) {
  try {
    const updateItems = req.body;
    updateItems.updated = new Date();
    await Question.updateOne({ _id: req.query.id }, updateItems, (err, result) => {
      if (err) {
        res
          .status(500)
          .json({ errors: err.mapped() });
      } else {
        res.status(201).json({
          message: 'Successfully insert question.',
          question: result,
        });
      }
    });
  } catch (e) {
    res.status(500).json({ e });
  }
}

async function getCategories(res) {
  console.log('try to find all categories');
  try {
    await Category
      .find((err, result) => {
        if (err || !result) {
          res.status(404).json({ errors: ['Failed to find database.'] });
          return true;
        }
        res.status(200).json({
          message: 'Successfully found database.',
          question: result,
        });
        return false;
      });
  } catch (e) {
    res.status(500).json({ e });
  }
}

async function getAllCategories() {
  console.log('try to find all categories');
  try {
    const categories = await Category
      .find((err, result) => {
        if (err || !result) {
          return false;
        }
        return result;
      });
    return categories;
  } catch (e) {
    // need change
    console.log('something wrong in getAllCategories');
  }
}

async function getCategoryNames(req, res, next) {
  try {
    const query = Category
      .find()
      .select('name -_id')
      .sort('name');
    const promise = await query.exec();
    return promise;
  } catch (error) {
    throw new Error(error);
  }
}
exports.getCategoryNames = getCategoryNames;

/*
async function getAllCategories() {
  console.log('try to find all categories');
  try {
    return Category
      .find({});
  } catch (e) {
    throw new Error(e);
  }
}
*/

// function getCollection(collectionName, callback) {}
module.exports.insertQuestion = insertQuestion;
module.exports.findQuestionByAuthor = findQuestionByAuthor;
module.exports.findQuestionByCategory = findQuestionByCategory;
module.exports.findQuestionById = findQuestionById;
module.exports.updateQuestionById = updateQuestionById;
module.exports.getQuestions = getQuestions;
module.exports.deleteQuestion = deleteQuestion;
module.exports.deleteQuestionById = deleteQuestionById;
module.exports.getCategories = getCategories;
module.exports.getCategoryNames = getCategoryNames;
module.exports.getAllCategories = getAllCategories;
