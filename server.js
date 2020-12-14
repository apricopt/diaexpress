const path = require("path");
const express = require("express");
const multer = require("multer");
const upload = multer();
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const session = require("express-session");
// morgan for logging
const morgan = require("morgan");
// bringing in the template engine handlebars
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);
const product = require("./routes/products");
const flash = require("connect-flash");

const cors = require("cors");
// importing routes here
const index = require("./routes/index");
const formhandler = require("./routes/formhandler");
const admin = require("./routes/admin");

// Loading the config
dotenv.config({ path: "./config/config.env" });

const app = express();
connectDB();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// handlebars
app.engine(".hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", ".hbs");

// static folder
app.use(express.static(path.join(__dirname, "public")));

// middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "babydaby",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 },
  })
);
app.use(flash());

app.use(cors());
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// using routes with router
app.use("/", index);
// posts
app.use("/api", formhandler);
// products
app.use("/api", product);
// admin
app.use("/admin", admin);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `Server just started on port ${PORT} and running in ${process.env.NODE_ENV} mode `
  );
});
