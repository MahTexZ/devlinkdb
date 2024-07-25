const express = require("express");
const {
  createFormCtrl,
  getFormsCtrl,
  deleteFormCtrl,
  deleteAllFormsCtrl,
} = require("../../controllers/forms/formCtrl");

const formRouter = express.Router();

formRouter.post("/submit-form", createFormCtrl);

formRouter.get("/forms", getFormsCtrl);

formRouter.delete("/forms/:id", deleteFormCtrl);

formRouter.delete("/forms", deleteAllFormsCtrl);

module.exports = formRouter;
