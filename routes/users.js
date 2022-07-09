const auth = require("../middleware/auth");
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const _ = require("lodash");

//getting current logged in user
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/", async (req, res) => {
  const result = validate(req.body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  //create user only
  // res.send(_.pick(user, ["_id", "name", "email"]));

  const token = user.generateAuthToken();
  //create user and log them in
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
