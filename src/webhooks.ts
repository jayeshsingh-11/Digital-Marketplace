import express from 'express'
import { WebhookRequest } from './server'

export const stripeWebhookHandler = async (
  req: express.Request,
  res: express.Response
) => {
  // Webhook handler removed as Stripe is replaced by Razorpay
  return res.status(200).send()
}
