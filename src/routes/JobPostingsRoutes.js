import express from "express";
import {
    registerJobPosting,
    editJobPosting,
    deleteJobPosting,
    getOneJobPosting,
    listJobPostings,
} from "../controllers/JobPostingsController.js";

const router = express.Router();

router.post("/register", registerJobPosting);
router.put("/edit/:jpno", editJobPosting);
router.delete("/delete/:jpno", deleteJobPosting);
router.get("/list", listJobPostings);
router.get("/:jpno", getOneJobPosting);

export default router;
