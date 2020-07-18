import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import mongoose from "mongoose";

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
app.set("view engine", "ejs");
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Routes
app.use("/", require("./routes/home"));

// Port Setting
app.listen(PORT, () => {
  console.log(`Server Starting... ${PORT}`);
});
