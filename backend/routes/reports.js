const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { createArrayCsvWriter } = require('csv-writer');
const db = new Database(path.join(__dirname, '../../database/inventory.db'));

router.get('/inventory-report', authenticateToken, async (req, res) => {
  try {
    const { format = 'json', locationId } = req.query;
    let query = `SELECT p.*, i.quantity, l.name as location_name
                 FROM products p JOIN inventory i ON p.id = i.product_id
                 JOIN locations l ON i.location_id = l.id WHERE p.is_active = 1`;
    const params = [];
    if (locationId) { query += ' AND i.location_id = ?'; params.push(locationId); }
    const data = db.prepare(query).all(...params);
    
    if (format === 'json') {
      res.json(data);
    } else if (format === 'csv') {
      const csvWriter = createArrayCsvWriter({ path: '/tmp/inventory-report.csv', 
        header: ['SKU', 'Name', 'Quantity', 'Location', 'Cost Price', 'Selling Price'] });
      await csvWriter.writeRecords(data.map(d => [d.sku, d.name, d.quantity, d.location_name, d.cost_price, d.selling_price]));
      res.download('/tmp/inventory-report.csv');
    } else if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Inventory Report');
      worksheet.columns = [
        { header: 'SKU', key: 'sku', width: 15 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'Location', key: 'location_name', width: 20 },
        { header: 'Cost Price', key: 'cost_price', width: 12 },
        { header: 'Selling Price', key: 'selling_price', width: 12 }
      ];
      worksheet.addRows(data);
      await workbook.xlsx.writeFile('/tmp/inventory-report.xlsx');
      res.download('/tmp/inventory-report.xlsx');
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
