import db from "../configs/Database.js";
import Funding from "./FundingModel.js";
import Project from "./ProjectModel.js";

Project.hasMany(Funding, { foreignKey: 'project_id' });
Funding.belongsTo(Project, { foreignKey: 'project_id' });

(async () => {
    try{
        await db.authenticate();
        console.log("Koneksi database berhasil!");

        await db.sync({alter: true});
        console.log("Semua tabel berhasil disinkronisasi");
    }catch(err){
        console.log(`Gagal Connect : ${err}`);
    }
})();

export {Project};