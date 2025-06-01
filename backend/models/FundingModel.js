import { DataTypes } from "sequelize";
import db from "../configs/Database.js";

const Funding = db.define('Funding', {
  funding_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  }
}, {
  timestamps: false,
});

export default Funding;