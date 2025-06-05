import Project from '../models/ProjectModel.js';
import cloudinary from '../configs/Cloudinary.js';
import streamifier from 'streamifier';
import { Sequelize } from 'sequelize';
import Funding from '../models/FundingModel.js';

const ProjectController = {
    async getAllProjects(req, res) {
        try {
            const projects = await Project.findAll({
                where: { status: 'active' },
                attributes: {
                    include: [
                        // Hitung total donasi dari Funding dengan SUM(amount)
                        [
                            Sequelize.literal(`(
              SELECT COALESCE(SUM(amount), 0)
              FROM Fundings
              WHERE Fundings.project_id = Project.project_id
            )`),
                            'total_donations'
                        ]
                    ]
                }
            });

            res.status(200).json({ projects });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Gagal mengambil data project', error: error.message });
        }
    },

    // 🟢 Tambah project baru
    async createProject(req, res) {
        const {
            user_id,
            title,
            description,
            target_amount,
            deadline,
            latitude,
            longitude,
        } = req.body;


        try {
            let img_url = null;

            // Upload gambar jika ada file
            if (req.file) {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'funding_project' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
                img_url = result.secure_url;
            }

            const newProject = await Project.create({
                user_id,
                title,
                description,
                target_amount,
                deadline,
                latitude,
                longitude,
                img_url,
                status: 'active',
            });

            res.status(201).json({ message: 'Project created successfully', project: newProject });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to create project', error: error.message });
        }
    },

    // ✏️ Edit project (hanya owner yang boleh)
    async updateProject(req, res) {
        try {
            const { user_id, project_id } = req.body;
            console.log(`apakah ${user_id} sama dengan ${project_id}`);
            // Cari project dulu untuk cek ownership dan keberadaan
            const project = await Project.findByPk(project_id);
            if (!project) return res.status(404).json({ message: 'Project tidak ditemukan' });
            if (project.user_id != user_id) return res.status(403).json({ message: 'Unauthorized' });

            // Kumpulkan data yang ingin diupdate
            const updateData = {};
            const fieldsToUpdate = ['title', 'description', 'target_amount', 'deadline', 'latitude', 'longitude', 'status'];

            fieldsToUpdate.forEach(field => {
                if (req.body[field] !== undefined) {
                    updateData[field] = req.body[field];
                }
            });

            // Jika ada file image, upload ke Cloudinary
            if (req.file) {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'funding_project' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
                updateData.img_url = result.secure_url;
            }

            // Jalankan update dengan Sequelize update
            await Project.update(updateData, { where: { project_id } });

            // Ambil data project terbaru setelah update
            const updatedProject = await Project.findByPk(project_id);

            res.status(200).json({ message: 'Project berhasil diperbarui', project: updatedProject });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Gagal update project', error: error.message });
        }
    },

    async getUserParticipatedProjects(req, res) {
        const { user_id } = req.body;

        try {
            // Cari funding yang user lakukan, ambil project_id-nya
            const fundings = await Funding.findAll({
                where: { user_id },
                attributes: ['project_id'],
            });

            // Ambil list project_id unik
            const projectIds = [...new Set(fundings.map(f => f.project_id))];

            if (projectIds.length === 0) {
                return res.status(200).json({ projects: [] });
            }

            // Cari project berdasarkan projectIds tersebut, dan hitung total donasi
            const projects = await Project.findAll({
                where: { project_id: projectIds },
                attributes: {
                    include: [
                        [
                            Sequelize.literal(`(
              SELECT COALESCE(SUM(amount), 0)
              FROM Fundings
              WHERE Fundings.project_id = Project.project_id
            )`),
                            'total_donations'
                        ]
                    ]
                }
            });

            res.status(200).json({ projects });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Gagal mengambil project partisipasi', error: error.message });
        }
    },

    async getProjectById(req, res) {
        const { project_id } = req.body;

        try {
            const project = await Project.findOne({
                where: { project_id },
                attributes: {
                    include: [
                        [
                            Sequelize.literal(`(
                            SELECT COALESCE(SUM(amount), 0)
                            FROM Fundings
                            WHERE Fundings.project_id = Project.project_id
                        )`),
                            'total_donations'
                        ]
                    ]
                }
            });

            if (!project) {
                return res.status(404).json({ message: 'Project tidak ditemukan' });
            }

            res.status(200).json({ project });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Gagal mengambil project', error: error.message });
        }
    },

    async getAllLatestProjects(req, res) {
        try {
            const projects = await Project.findAll({
                where: { status: 'active' },
                attributes: {
                    include: [
                        [
                            Sequelize.literal(`(
                            SELECT COALESCE(SUM(amount), 0)
                            FROM Fundings
                            WHERE Fundings.project_id = Project.project_id
                        )`),
                            'total_donations'
                        ]
                    ]
                },
                order: [['start_date', 'DESC']] // 🔽 urutkan berdasarkan yang terbaru
            });

            res.status(200).json({ projects });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Gagal mengambil data project', error: error.message });
        }
    },

    async cancelProject(req, res) {
        const { project_id, user_id } = req.body;

        try {
            const project = await Project.findByPk(project_id);

            if (!project) {
                return res.status(404).json({ message: 'Project tidak ditemukan' });
            }

            // Pastikan hanya owner yang boleh membatalkan project
            if (project.user_id != user_id) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            if (project.status === 'canceled') {
                return res.status(400).json({ message: 'Project sudah dibatalkan sebelumnya' });
            }

            await project.update({ status: 'canceled' });

            res.status(200).json({ message: 'Project berhasil dibatalkan', project });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Gagal membatalkan project', error: error.message });
        }
    },

    async getAllProjectsByUserId(req, res) {
        const { user_id } = req.body;

        try {
            const projects = await Project.findAll({
                where: { user_id },
                attributes: {
                    include: [
                        [
                            Sequelize.literal(`(
                            SELECT COALESCE(SUM(amount), 0)
                            FROM Fundings
                            WHERE Fundings.project_id = Project.project_id
                        )`),
                            'total_donations'
                        ]
                    ]
                },
                order: [['createdAt', 'DESC']] // Optional: urutkan dari terbaru
            });

            res.status(200).json({ projects });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Gagal mengambil project milik user', error: error.message });
        }
    }
};

export default ProjectController;