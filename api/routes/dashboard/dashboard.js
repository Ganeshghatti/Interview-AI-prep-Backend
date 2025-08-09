import express from "express";
const router = express.Router();
import { getUserDashboard } from "../../controllers/dashboard/dashboard.js";
import userAuth from "../../middleware/user-auth.js";

router.route("/dashboard").get(userAuth, getUserDashboard);

export default router;
