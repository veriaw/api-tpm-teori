import Funding from '../models/FundingModel.js';
import Project from '../models/ProjectModel.js';

const FundingController = {
    async donate(req, res) {
        try {
            const { user_id, project_id, amount } = req.body;

            if (!project_id || !amount || amount <= 0) {
                return res.status(400).json({ message: "Project ID dan jumlah donasi harus valid" });
            }

            // Cek project aktif
            const project = await Project.findByPk(project_id);
            if (!project || project.status !== 'active') {
                return res.status(404).json({ message: "Project tidak ditemukan atau tidak aktif" });
            }

            // Cek funding user di project itu sudah ada atau belum
            const funding = await Funding.findOne({ where: { user_id, project_id } });

            if (funding) {
                // Update jumlah donasi langsung dengan update
                const newAmount = parseFloat(funding.amount) + parseFloat(amount);
                await Funding.update(
                    { amount: newAmount },
                    { where: { user_id, project_id } }
                );
                return res.status(200).json({ message: "Donasi berhasil diperbarui", amount: newAmount });
            } else {
                // Buat record funding baru
                const newFunding = await Funding.create({
                    user_id,
                    project_id,
                    amount,
                });
                return res.status(201).json({ message: "Donasi berhasil dibuat", funding: newFunding });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Gagal melakukan donasi", error: error.message });
        }
    },

    // Contoh method buat ambil total donasi user di project tertentu
    async getUserDonation(req, res) {
        try {
            const { user_id, project_id } = req.body;

            const funding = await Funding.findOne({ where: { user_id, project_id } });

            if (!funding) {
                return res.status(404).json({ message: "Belum ada donasi di project ini" });
            }

            res.status(200).json({ amount: funding.amount });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Gagal mengambil data donasi", error: error.message });
        }
    }
};

export default FundingController;