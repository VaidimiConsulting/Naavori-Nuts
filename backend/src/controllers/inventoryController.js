import * as inventoryRepo from '../repositories/inventoryRepository.js';

export const getInventory = async (req, res) => {
  try {
    const { search, filter } = req.query;
    const inventory = await inventoryRepo.getInventoryLedger({ search, filter });
    res.json({
      success: true,
      data: inventory,
      count: inventory.length
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory ledger' });
  }
};

export const adjustStock = async (req, res) => {
  try {
    const { variantId } = req.params;
    const delta = req.body.delta !== undefined ? Number(req.body.delta) : Number(req.body.adjustment);

    if (isNaN(delta)) {
      return res.status(400).json({ success: false, message: 'Valid stock delta is required' });
    }

    const updated = await inventoryRepo.adjustStock(variantId, delta);
    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    res.status(500).json({ success: false, message: 'Failed to adjust stock' });
  }
};

export const addPurchaseEntry = async (req, res) => {
  try {
    const { variant_id, batch_no, quantity, cost_per_unit, expiry_date, supplier_id, invoice_number } = req.body;

    if (!variant_id || !quantity || Number(quantity) <= 0) {
      return res.status(400).json({ success: false, message: 'Variant and a positive quantity are required' });
    }

    const result = await inventoryRepo.addBatchAndStock({
      variant_id,
      batch_no,
      quantity,
      cost_per_unit,
      expiry_date,
      supplier_id,
      invoice_number,
      user_id: req.user?.id
    });

    res.status(201).json({
      success: true,
      message: 'Stock batch and purchase entry recorded successfully',
      data: result
    });
  } catch (error) {
    console.error('Error adding purchase entry:', error);
    res.status(500).json({ success: false, message: 'Failed to add purchase entry' });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await inventoryRepo.getSuppliers();
    res.json({ success: true, data: suppliers });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suppliers' });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Supplier name is required' });

    const supplier = await inventoryRepo.createSupplier(req.body);
    res.status(201).json({ success: true, message: 'Supplier created successfully', data: supplier });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ success: false, message: 'Failed to create supplier' });
  }
};

export const getVariants = async (req, res) => {
  try {
    const variants = await inventoryRepo.getProductVariantsList();
    res.json({ success: true, data: variants });
  } catch (error) {
    console.error('Error fetching variants list:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch variants list' });
  }
};
