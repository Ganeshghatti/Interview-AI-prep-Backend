import { extractProfile } from "../../utils/resumeExtractor.js";

async function profileData(req, res) {
    try {
        const rawResumeContent = req.body.resume
        const extractedData = await extractProfile(rawResumeContent);

        res.status(200).json({
            success: true,
            msg: "Profile data extracted successfully",
            data: extractedData
        });
    } catch (error) {
        res.status(500).json({success: false, msg: error.message});
    }
}

export { profileData };
