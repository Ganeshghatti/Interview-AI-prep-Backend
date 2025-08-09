import express from "express";
const router = express.Router();
import {
  getAllActiveJobPositions,
} from "../../controllers/apply-jobs/get-jobs.js";
import userAuth from "../../middleware/user-auth.js";

router.route("/get-active-job-positions").get(userAuth, getAllActiveJobPositions);

export default router;
