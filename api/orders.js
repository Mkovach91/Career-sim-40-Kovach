const express = require("express");
const prisma = require("../prisma");
const { authenticate } = require("./auth");

const router = express.Router();

router.get("/", authenticate, async (req, res, next)=> {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user.id },
      include: {
        items: true,
      },
    });
    res.json(orders)
  } catch (error) {
    next(error)
  }
});



module.exports = router;