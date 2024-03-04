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

// Middleware for logging in development mode
if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
}

// Middleware for parsing raw JSON requests for Stripe webhook
app.post("/webhook", express.raw({ type: 'application/json' }), async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    // Ensure req.body is provided as Buffer
    event = Stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.stripe_secret
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  if (event.type === "checkout.session.completed") {
    console.log(`Unhandled event type ${event.type}`);
    // Call controller function to handle webhook event
    webhookCreateOrder(event.data.object);
  }
  
  res.status(200).json({ received: true });
});

// Middleware for parsing JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'uploads')));

// Connect to database
databaseConect();

// Define server routes
serverRoutes(app);

// Middleware for handling undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find this route ${req.originalUrl}`, 404));
});

// Global error handler middleware
app.use(GlobalErrorHandler);

// Start server
const port = process.env.PORT || 8000; // Corrected process.env.PORT
const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});


