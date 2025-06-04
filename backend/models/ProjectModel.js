import { DataTypes } from "sequelize";
import db from "../configs/Database.js";

const Project = db.define('Project', {
  project_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  target_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW // otomatis isi tanggal saat dibuat
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  img_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
}, {
  timestamps: false // jika tabelmu tidak punya kolom createdAt & updatedAt
});

export default Project;