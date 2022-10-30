require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/user.model");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
const PORT = process.env.PORT || 3001;
const dbURL = process.env.MONGODB_URL;

mongoose
  .connect(dbURL)
  .then(() => {
    console.log(`mongoDB atlas is connected`);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/register", async (req, res) => {
  try {
    bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
      const newUser = new User({
        email: req.body.email,
        password: hash,
      });
      await newUser.save();
      res.status(201).json(newUser);
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    if (user) {
      // Load hash from your password DB.
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          res.status(200).json({ status: `valid user` });
        }
      });
    } else {
      res.status(404).json({ status: `not valid user` });
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

//route not found
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

//server error handling
app.use((err, req, res) => {
  res.status(500).json({
    message: "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
