import cron from 'node-cron';
import Project from '../models/Project.js';
import Funding from '../models/Funding.js';
import { Op, Sequelize } from 'sequelize';

cron.schedule('0 0 * * *', async () => {
  try {
    const today = new Date();

    // Cari total donasi per project
    const fundingSums = await Funding.findAll({
      attributes: [
        'project_id',
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'total_donasi']
      ],
      group: ['project_id'],
      raw: true
    });

    // Map project_id => total_donasi
    const fundingMap = {};
    fundingSums.forEach(f => {
      fundingMap[f.project_id] = parseFloat(f.total_donasi);
    });

    // Cari semua project aktif dengan deadline lewat
    const projects = await Project.findAll({
      where: {
        deadline: { [Op.lt]: today },
        status: 'active',
      }
    });

    // Filter project yang donasinya kurang dari target_amount
    const toCancel = projects.filter(p => {
      const totalDonasi = fundingMap[p.project_id] || 0;
      return totalDonasi < parseFloat(p.target_amount);
    });

    // Update status ke 'cancelled' untuk project gagal tersebut
    const idsToCancel = toCancel.map(p => p.project_id);
    if (idsToCancel.length > 0) {
      await Project.update(
        { status: 'cancelled' },
        { where: { project_id: idsToCancel } }
      );
    }

    console.log(`[${new Date().toISOString()}] Auto-cancelled ${idsToCancel.length} failed project(s).`);
  } catch (error) {
    console.error('Auto-cancel failed:', error);
  }
});