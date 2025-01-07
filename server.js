const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const Stripe = require("stripe")(process.env.stripe_secret);
const bodyParser = require("body-parser");
const hpp = require("hpp");
const helmet = require("helmet"); // Updated import for helmet
const ExpressMongoSanitize = require("express-mongo-sanitize");
const AppError = require("./utils/AppError");
const GlobalErrorHandler = require("./middlewares/GlobalErrorHandler");
const databaseConect = require("./config/databaseConect");
const serverRoutes = require("./utils");
const { webhookCreateOrder } = require("./controllers/orderController");

const app = express();

app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res, next) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      // Ensure req.body is used for signature verification
      event = await Stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.stripe_webhook
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === "checkout.session.completed") {
      webhookCreateOrder(event.data.object);
    }
    res.status(200).json({ received: true });
  }
);

app.use(express.json());

app.use(express.static(path.join(__dirname, "uploads")));

dotenv.config({ path: "config.env" });

if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
}

// Use Helmet for security
// app.use(helmet());

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Enable CORS before your routes
app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  })
);

// Handle pre-flight requests
app.options("*", cors());

app.use(ExpressMongoSanitize());

app.use(hpp());

// app.use(
//   rateLimit({
//     windowMs: 60 * 1000,
//     max: 20,
//     message: "too many requests please try again in 1 minute",
//   })
// );

// Connect to database
databaseConect();

// Apply routes
serverRoutes(app);

// Handle all other routes
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find this route ${req.originalUrl}`, 404));
});

// Global error handler
app.use(GlobalErrorHandler);

const port = process.env.PORT || 8000;
const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
