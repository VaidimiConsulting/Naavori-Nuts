// Online payment gateway disabled. Naavori Nuts operates exclusively on Cash on Delivery (COD).

export const createRazorpayOrder = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Online payment is currently disabled. All orders are fulfilled via Cash on Delivery (COD).'
  });
};

export const verifyPayment = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Online payment is currently disabled. All orders are fulfilled via Cash on Delivery (COD).'
  });
};
