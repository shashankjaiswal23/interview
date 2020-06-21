const express = require('express');
const mongoose = require('mongoose');
const app = express();
const userRouter = require('./routers/user');
const productRouter = require('./routers/product')

mongoose.connect(
  "mongodb+srv://shashank:G5dqLluBdB3krqkm@cluster0-bsjd5.mongodb.net/project",
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (!err) {
      console.log("MongoDb Connection Succeeded.");
    } else {
      console.log(err);
    }
  }
);

app.use(express.json())
app.use(userRouter);
app.use(productRouter)

app.listen(6000, (req, res)=>{
    console.log('App Started')
})