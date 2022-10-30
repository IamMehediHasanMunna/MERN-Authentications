require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const app = express();
const User = require("./models/user.model");

require("./config/database");
require("./config/passport");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());

//home route
app.get("/", (req, res) => {
  res.send(`<h1>welcome to the Home page</h1>`);
});

//register route
app.post("/register", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user) return res.status(400).send("User alredy exists");

    bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
      // Store hash in password DB.
      const newUser = new User({
        username: req.body.username,
        password: hash,
      });
      await newUser
        .save()
        .then((user) => {
          res.send({
            success: true,
            message: "User saved successfully",
            user: {
              id: user._id,
              username: user.username,
            },
          });
        })
        .catch((error) => {
          res.send({
            success: false,
            message: "user is not created",
            error: error,
          });
        });
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//login route
app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.status(401).send({
      success: false,
      message: "User not found",
    });
  }

  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(401).send({
      success: false,
      message: "Incorrect password",
    });
  }
  const payload = {
    id: user._id,
    username: user.username,
  };

  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: "2d",
  });
  return res.status(200).send({
    success: true,
    message: "User is logged in successfully",
    token: "Bearer" + token,
  });
});

//profile route : protected
app.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    return res.status(200).send({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
      },
    });
  }
);

//resource not found route
app.use((req, res, next) => {
  res.status(404).json({
    message: "route not found",
  });
});

//server error route
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("somethng is broken!");
});

module.exports = app;
