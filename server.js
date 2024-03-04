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
app.post("/webhook",express.raw({ type: 'application/json' }),async(req, res, next)=>{
  const sig = req.headers["stripe-signature"];
  let event;
  try {
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
    webhookCreateOrder(event.data.object);
  }
  res.status(200).json({ received: true });
})
app.use(express.json());
app.use(express.static(path.join(__dirname,'uploads')))
databaseConect();

serverRoutes(app)
app.all("*", (req, res, next) => {
  next(new AppError(`cant find this route ${req.originalUrl}`, 400));
});
app.use(GlobalErrorHandler);
const port = process.env.port || 8000
const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
process.on("unhandledRejection", (err) => {
  console.log(`error from sans ${err.name} | ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

