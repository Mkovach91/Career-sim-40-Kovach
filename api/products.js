const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

router.get("/", async (req, res, next) =>{
  try {
    const products = await prisma.product.findMany();
    res.json(products)
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    if (req.user) {
      const productWithOrders = await prisma.product.findUnique({
        where: {
          id: +id, 
        },
        include: {
          orders: true, 
        },
      });

      if (!productWithOrders) {
        return res.status(404).json({ message: "Product not found" });
      }

      const filteredOrders = productWithOrders.orders.filter(
        (order) => order.customerId === req.user.id
      );

      productWithOrders.orders = filteredOrders;

      return res.json(productWithOrders);
    }
    const product = await prisma.product.findUnique({
      where: {
        id: +id,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    next(error);
  }
});

module.exports = router;