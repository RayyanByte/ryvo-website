const Menu = require("../models/Menu");

const getMenu = async (req, res) => {
  try {
    const menu = await Menu.find({ isAvailable: true }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: menu.length,
      data: menu
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Menu fetch failed",
      error: error.message
    });
  }
};

module.exports = { getMenu };
