const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const Stripe = require("stripe")(process.env.stripe_secret);
const rateLimit = require("express-rate-limit");
const hpp = require('hpp');
const { default: helmet } = require("helmet");
const ExpressMongoSanitize = require("express-mongo-sanitize");
const AppError = require("./utils/AppError");
const GlobalErrorHandler = require("./middlewares/GlobalErrorHandler");
const databaseConect = require("./config/databaseConect");
const serverRoutes = require("./utils");
const { webhookCreateOrder } = require("./controllers/orderController");



const app = express();
dotenv.config({ path: "config.env" });

if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "50kb" }));

app.use(helmet());

app.use(ExpressMongoSanitize());

app.use(hpp());

app.use(rateLimit({
  windowMs: 60 * 1000, 
  max:30,
  message: "too many requests please try again in 1 minute"
}));

app.use(express.static(path.join(__dirname, 'uploads')));

databaseConect();

serverRoutes(app);

// Middleware for parsing raw JSON requests for Stripe webhook
app.post("/webhook", express.raw({ type: 'application/json' }), async (req, res, next) => {

  const sig = req.headers["stripe-signature"];
  let event;
  try {
    // Ensure req.body is used for signature verification
    event = Stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.stripe_webhook
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  if (event.type === "checkout.session.completed") {
    console.log(`Unhandled event type ${event.type}`);
    webhookCreateOrder(event.data.object);
  }
  
  res.status(200).json({ received: true });
});

app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find this route ${req.originalUrl}`, 404));
});

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