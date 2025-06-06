import express from "express";
import upload from "../middleware/multer.js";
import ProjectController from "../controllers/ProjectController.js";
import FundingController from "../controllers/FundingController.js";

const router = express.Router();

// ✅ Project Routes
router.get("/get-project", ProjectController.getAllProjects);
router.get("/get-latest-project", ProjectController.getAllLatestProjects);
router.post("/project", ProjectController.getProjectById);
router.post('/get-projects-by-user', ProjectController.getAllProjectsByUserId);
router.post("/projectCanceled", ProjectController.cancelProject);
router.post("/create-project", upload.single("image"), ProjectController.createProject);
router.put("/update-project",upload.single("image"), ProjectController.updateProject);
router.post("/participated-project", ProjectController.getUserParticipatedProjects);
// Tambahkan jika ingin ambil semua project dan total funding
// router.get("/all-projects", ProjectController.getAllProjects);

// ✅ Funding Routes
router.post("/donate",FundingController.donate);
router.post("/get-my-donation",FundingController.getUserDonation);


router.all("\\*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default router;
