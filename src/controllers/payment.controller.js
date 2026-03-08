import Stripe from "stripe";
import { stripeSecretKey, stripeWebhookSecret } from "../config/env.js";
import Rental from "../models/Rental.js";
import Payment from "../models/Payment.js";

const stripe = new Stripe(stripeSecretKey);

// Stripe does not support MAD — charges are made in EUR.
// 1 MAD ≈ 0.092 EUR  (update MAD_TO_EUR if the exchange rate changes)
const MAD_TO_EUR = parseFloat(process.env.MAD_TO_EUR || "0.092");

/**
 * POST /api/payments/create-intent
 * Authenticated. Creates a Stripe PaymentIntent and returns its clientSecret.
 * Body: { amount: number (MAD), equipmentId, startDate, endDate }
 */
const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, equipmentId, startDate, endDate } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Convert MAD → EUR → smallest currency unit (cents)
    const amountInEurCents = Math.round(Number(amount) * MAD_TO_EUR * 100);

    // Stripe minimum charge is 50 cents
    if (amountInEurCents < 50) {
      return res.status(400).json({ message: "Amount too small to charge" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInEurCents,
      currency: "eur",
      // Let Stripe automatically determine the best payment method
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      metadata: {
        equipmentId: equipmentId?.toString() || "",
        startDate: startDate || "",
        endDate: endDate || "",
        amountMad: String(amount),
        userId: req.user?.id?.toString() || "",
      },
    });

    // Persist a pending payment record in the database
    await Payment.create({
      userId: req.user.id,
      equipmentId: equipmentId || null,
      stripePaymentIntentId: paymentIntent.id,
      amountMad: Number(amount),
      amountEurCents: amountInEurCents,
      status: "pending",
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payments/user/:userId
 * Returns all payment records for a given user, newest first.
 */
const getPaymentsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Payment.find({ userId })
        .populate("rentalId", "startDate endDate rentalStatus")
        .populate("equipmentId", "name images")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments({ userId }),
    ]);

    return res.json({
      data: payments,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payments/:id
 * Returns a single payment record by its MongoDB _id.
 */
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("userId", "name email")
      .populate("rentalId")
      .populate("equipmentId", "name images");

    if (!payment) return res.status(404).json({ message: "Payment not found" });
    return res.json({ data: payment });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payments/webhook
 * Stripe webhook — NO auth middleware, raw body required.
 * Handles payment_intent.succeeded to mark rental as paid.
 */
const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        // Update rental payment status
        await Rental.findOneAndUpdate(
          { stripeSessionId: pi.id },
          { paymentStatus: "paid" },
        );
        // Update payment record status
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: pi.id },
          { status: "succeeded" },
        );
        console.log(
          `[Stripe] PaymentIntent ${pi.id} succeeded — rental marked paid`,
        );
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        // Update payment record status and store failure reason
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: pi.id },
          {
            status: "failed",
            failureMessage: pi.last_payment_error?.message || "Unknown error",
          },
        );
        console.warn(
          `[Stripe] PaymentIntent ${pi.id} failed:`,
          pi.last_payment_error?.message,
        );
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[Stripe webhook] DB update error:", err.message);
  }

  res.json({ received: true });
};

export default {
  createPaymentIntent,
  handleWebhook,
  getPaymentsByUser,
  getPaymentById,
};
