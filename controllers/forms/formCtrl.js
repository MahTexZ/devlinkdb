const { AppErr, appErr } = require("../../utils/appErr");
const Form = require("../../models/form/Form");

const createFormCtrl = async (req, res, next) => {
  const {
    name,
    email,
    phone,
    projects,
    message,
    agreeToCalls,
    agreeToUpdates,
  } = req.body;

  try {
    // Create the form entry
    const formCreated = await Form.create({
      name,
      email,
      phone,
      projects,
      message,
      agreeToCalls,
      agreeToUpdates,
    });

    res.json({
      status: "success",
      data: formCreated,
    });
  } catch (error) {
    next(appErr(error.message, 400));
  }
};

const getFormsCtrl = async (req, res, next) => {
  try {
    // Fetch all forms from the database
    const forms = await Form.find();

    res.json({
      status: "success",
      data: forms,
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};



// Controller to delete a single form
const deleteFormCtrl =  async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.status(200).json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to delete all forms
const deleteAllFormsCtrl = async (req, res, next) => {
  try {
    await Form.deleteMany();
    res.status(200).json({
      status: "success",
      message: "All forms deleted successfully",
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

module.exports = { createFormCtrl, getFormsCtrl,deleteFormCtrl,deleteAllFormsCtrl };
