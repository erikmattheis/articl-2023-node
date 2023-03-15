const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const categoriesValidation = require("../../validations/categories.validation");
const categoriesController = require("../../controllers/categories.controller");

const router = express.Router();

router.post(
  "/ai-summary",
  auth("manageUsers"),
  validate(categoriesValidation.getAISummary),
  categoriesController.getAISummary
);
router.post(
  "/",
  auth("manageUsers"),
  validate(categoriesValidation.createCategories),
  categoriesController.upsertCategory
);
router.put(
  "/:id",
  auth("manageUsers"),
  validate(categoriesValidation.updateCategory),
  categoriesController.upsertCategory
);
router.post(
  "/order",
  auth("manageUsers"),
  validate(categoriesValidation.updateCategoriesOrder),
  categoriesController.updateCategoriesOrder
);
router.get(
  "/titles",
  validate(categoriesValidation.getCategorySlugs),
  categoriesController.getCategorySlugs
);
router.get(
  "/:id",
  validate(categoriesValidation.getCategory),
  categoriesController.getCategory
);
router.delete(
  "/",
  auth("manageUsers"),
  validate(categoriesValidation.deleteCategory),
  categoriesController.deleteCategory
);

// router.get('/:id', auth(), validate(categoriesValidation.getUser), categoriesController.getCategory);

module.exports = router;
