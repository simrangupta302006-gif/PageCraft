
const Portfolio = require("../models/Portfolio");

const createPortfolio = async (req, res) => {
  try {
    const { title, theme } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const slugBase = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const slug = `${slugBase}-${Date.now()}`;

    const portfolio = await Portfolio.create({
      userId: req.userId,
      title,
      slug,
      theme: theme || "default",
      content: { blocks: [] },
    });

    return res.status(201).json(portfolio);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create portfolio",
      error: error.message,
    });
  }
};

const getMyPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    return res.json(portfolios);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch portfolios",
      error: error.message,
    });
  }
};

const deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!portfolio) {
      return res.status(404).json({
        message: "Portfolio not found",
      });
    }

    return res.json({
      message: "Portfolio deleted successfully",
      id: portfolio._id,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid portfolio ID",
      });
    }

    return res.status(500).json({
      message: "Failed to delete portfolio",
      error: error.message,
    });
  }
};

const updatePortfolio = async (req, res) => {
  try {
    const { title, theme, content } = req.body;

    if (
      title === undefined &&
      theme === undefined &&
      content === undefined
    ) {
      return res.status(400).json({
        message:
          "At least one portfolio field (title, theme, or content) is required",
      });
    }

    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!portfolio) {
      return res.status(404).json({
        message: "Portfolio not found",
      });
    }

    if (typeof title === "string" && title.trim()) {
      portfolio.title = title.trim();
    }

    if (typeof theme === "string" && theme.trim()) {
      portfolio.theme = theme.trim();
    }

    if (content !== undefined) {
      portfolio.content = content;
    }

    await portfolio.save();

    return res.json(portfolio);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update portfolio",
      error: error.message,
    });
  }
};

const publishPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!portfolio) {
      return res.status(404).json({
        message: "Portfolio not found",
      });
    }

    portfolio.published = true;
    await portfolio.save();

    return res.json(portfolio);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to publish portfolio",
      error: error.message,
    });
  }
};

const getPublicPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      slug: req.params.slug,
      published: true,
    }).select("title slug content theme published createdAt updatedAt");

    if (!portfolio) {
      return res.status(404).json({
        message: "Portfolio not found",
      });
    }

    return res.json(portfolio);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch public portfolio",
      error: error.message,
    });
  }
};

module.exports = {
  createPortfolio,
  getMyPortfolios,
  deletePortfolio,
  updatePortfolio,
  publishPortfolio,
  getPublicPortfolio,
};
