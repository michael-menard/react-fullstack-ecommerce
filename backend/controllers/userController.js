const User = require("../models/userModel");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const { generateAuthToken } = require("../utils/generateAuthToken");

/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 * @constructor
 */
const GetUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("");
    return res.send(users);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 * @constructor
 */
const RegisterUser = async (req, res, next) => {
  try {
    const { name, lastName, email, password } = req.body;

    // Todo: replace with Zod
    if (!name || !lastName || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      const hashedPassword = hashPassword(password);
      const user = await User.create({
        name,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
      });
      return res
        .cookie("access_token", generateAuthToken( user._id, user.name, user.lastName, user.email, user.isAdmin ), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict"
        })
        .status(201)
        .json({ success: true, userCreated: {
          _id: user._id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          isAdmin: user.isAdmin,
        } });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}

/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 * @constructor
 */
const LoginUser = async (req, res, next) => {
  try {
    const { email, password, doNotLogout } = req.body;
    if (!(email && password)) {
      return res.status(400).send("All inputs are required");
    }

    const user = await User.findOne({ email });
    if (user && (await comparePassword(password, user.password))) {
      // to do: compare passwords
      let cookieParams = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      };

      if (doNotLogout) {
        cookieParams = { ...cookieParams, maxAge: 1000 * 60 * 60 * 24 * 7 }; // 1000=1ms
      }

      return res.cookie(
        "access_token",
        generateAuthToken(
          user._id,
          user.name,
          user.lastName,
          user.email,
          user.isAdmin
        ),
        cookieParams
      ).json({
        success: "user logged in",
        userLoggedIn: { _id: user._id, name: user.name, lastName: user.lastName, email: user.email, isAdmin: user.isAdmin, doNotLogout }
      });
    } else {
      return res.status(401).send("wrong credentials")
    }
  } catch (err) {
    next(err);
  }
}


const GetUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).orFail();
    return res.send(user);
  } catch(err) {
    next(err)
  }
}

/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<void>}
 */
const UpdateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).orFail();
    user.name = req.body.name || user.name;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber;
    user.address = req.body.address;
    user.country = req.body.country;
    user.zipCode = req.body.zipCode;
    user.city = req.body.city;
    user.state = req.body.state;
    if (req.body.password !== user.password) {
      user.password = hashPassword(req.body.password);
    }
    await user.save();

    res.json({
      success: "user updated",
      userUpdated: {
        _id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  GetUsers,
  RegisterUser,
  LoginUser,
  UpdateUserProfile,
  GetUserProfile,
};
