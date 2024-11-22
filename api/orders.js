const express = require("express");
const prisma = require("../prisma");
const { authenticate } = require("./auth");

const router = express.Router();

router.get("/", authenticate, async (req, res, next)=> {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user.id },
      include: {items: true },
    });
    res.json(orders)
  } catch (error) {
    next(error)
  }
});

router.post("/", async (req, res, next) => {
  const { date, note, productIds } = req.body;

  try {
    const order = await prisma.order.create({
      data: {
        date,
        note,
        customerId: req.user.id,
        items: {
          create: productIds.map((productId) => ({
            productId: +productId,
          })),
        },
      },
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: +id },
      include: { items: { include: { product: true, }, }, },
    });

    if (order.customerId !== req.user.id) {
      throw { status: 403, message: "You do not own this order." };
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

module.exports = router;