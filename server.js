const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const Stripe = require("stripe")(process.env.stripe_secret);
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

// Middleware for parsing raw JSON requests for Stripe webhook
app.post("/webhook", express.raw({ type: 'application/json' }), async (req, res, next) => {
  console.log("webhook work");
  const data = req.body.toString('utf8');
  console.log(data);
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    // Ensure req.body is used for signature verification
    event = Stripe.webhooks.constructEvent(
      data,
      sig,
      process.env.stripe_secret
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

app.use(express.json());

app.use(express.static(path.join(__dirname, 'uploads')));

databaseConect();

serverRoutes(app);

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