import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import mongoose from "mongoose";
import helmet from "helmet";
import flash from "connect-flash";
import session from "express-session";
import passport from "./config/passport";
import util from "./util";

dotenv.config();

const app = express();
const PORT = 3000;

// DB setting
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(process.env.MONGO_DB);

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB Connection");
});

db.on("error", (err) => {
  console.log("DB ERROR:", err);
});

// Other Settings
// view engine
app.set("view engine", "ejs");

// static
app.use(express.static(`${__dirname}/public`));

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// method-override
app.use(methodOverride("_method"));

// helmet
app.use(helmet());
app.disable("x-powered-by");

// flash
app.use(flash());

// session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

// passport
app.use(passport.initialize());
app.use(passport.session());

// Custim Middlewares
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

// Routes
// Routes - Home
app.use("/", require("./routes/home"));

// Routes - Posts
// util.getPostQueryString 미들웨어를 posts 의 경로들이
// request 되기 전에 배치하여 모든 post routes 에서
// res.locals.getPostQueryString 를 사용할 수 있게 하였다
app.use("/posts", util.getPostQueryString, require("./routes/posts"));

// Routes - Users
app.use("/users", require("./routes/users"));

// Routes - Comments
app.use("/comments", util.getPostQueryString, require("./routes/comments"));

// Port Setting
app.listen(PORT, () => {
  console.log(`Server Starting... ${PORT}`);
});
