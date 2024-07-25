const express = require("express");
const cors = require("cors");
const formRouter = require("./routes/form/FormRoute");
const userRouter = require("./routes/user/UserRoute")
const globalErrHandler = require("./middlewares/globalErrHandler");
const Form = require("./models/form/Form");
require("dotenv").config();
require("./config/dbConnect");
const app = express();

//middlewares
app.use(express.json());
app.use(cors()); // Enable CORS for all routes





app.get("/", async(req, res)=>{
  try {
    const posts = await 
    Form.find();
    res.json({
      status: "success",
      data: posts,
    })
  } catch (error) {
    res.json(error);
  }
})


//users route
app.use("/api/v1/users/", userRouter);

app.use("/api/v1", formRouter);



//Error handlers middleware
app.use(globalErrHandler);


//404 error
app.use("*", (req, res) => {
  console.log(req.originalUrl);
  res.status(404).json({
    message: `${req.originalUrl} - Route Not Found`,
  });
});
//Listen to server
const PORT = process.env.PORT || 9000;

app.listen(PORT, console.log(`Server is up and running on ${PORT}`));