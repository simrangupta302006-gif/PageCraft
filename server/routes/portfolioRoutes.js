const express = require("express");

const {
  createPortfolio,
  getMyPortfolios,
  deletePortfolio,
  updatePortfolio,
  publishPortfolio,
  getPublicPortfolio,
} = require("../controllers/portfolioController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createPortfolio);

router.get("/", protect, getMyPortfolios);

router.get("/public/:slug", getPublicPortfolio);

router.put("/:id", protect, updatePortfolio);

router.delete("/:id", protect, deletePortfolio);

router.put(
  "/:id/publish",
  protect,
  publishPortfolio
);

module.exports = router;