import pool from '../config/db.js';

export const getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM site_settings');
    const settings = rows.reduce((acc, row) => ({ ...acc, [row.setting_key]: row.setting_value }), {});
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, value, value]
      );
    }
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

export const getCms = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cms_content');
    const content = rows.reduce((acc, row) => ({ ...acc, [row.section_key]: row.content }), {});
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch CMS content' });
  }
};

export const updateCms = async (req, res) => {
  try {
    const { section_key, content } = req.body;
    await pool.query(
      'INSERT INTO cms_content (section_key, content) VALUES (?, ?) ON DUPLICATE KEY UPDATE content = ?',
      [section_key, JSON.stringify(content), JSON.stringify(content)]
    );
    res.json({ success: true, message: 'CMS updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update CMS' });
  }
};
