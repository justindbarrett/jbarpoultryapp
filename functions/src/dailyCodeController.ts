import { Response } from "express";
import { db } from "./config/firebase";

type DailyCodeType = {
    code: string;
    date: string;
    createdAt: any;
};

type VerifyCodeRequest = {
    body: {
        code: string;
    };
};

type Request = {
    body: any;
    params: any;
};

const dailyCodeCollectionPath = "dailyCodes";

const getCurrentCode = async (req: Request, res: Response) => {
    try {
        const codeDoc = await db.collection(dailyCodeCollectionPath).doc("current").get();
        
        if (!codeDoc.exists) {
            res.status(404).json({
                status: "error",
                message: "No daily code found",
            });
            return;
        }
        
        const codeData = codeDoc.data() as DailyCodeType;
        
        res.status(200).json({
            status: "success",
            message: "Daily code retrieved successfully",
            data: {
                code: codeData.code,
                date: codeData.date,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            status: "error",
            message: error.message || "Error retrieving daily code",
        });
    }
};

const verifyCode = async (req: VerifyCodeRequest, res: Response) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            res.status(400).json({
                status: "error",
                message: "Code is required",
            });
            return;
        }
        
        const codeDoc = await db.collection(dailyCodeCollectionPath).doc("current").get();
        
        if (!codeDoc.exists) {
            res.status(404).json({
                status: "error",
                message: "No daily code found",
            });
            return;
        }
        
        const codeData = codeDoc.data() as DailyCodeType;
        const today = new Date().toISOString().slice(0, 10);
        
        if (codeData.code === code && codeData.date === today) {
            res.status(200).json({
                status: "success",
                message: "Code verified successfully",
                data: {
                    valid: true,
                },
            });
        } else if (codeData.date !== today) {
            res.status(400).json({
                status: "error",
                message: "Code has expired",
                data: {
                    valid: false,
                },
            });
        } else {
            res.status(400).json({
                status: "error",
                message: "Invalid code",
                data: {
                    valid: false,
                },
            });
        }
    } catch (error: any) {
        res.status(500).json({
            status: "error",
            message: error.message || "Error verifying code",
        });
    }
};

export { getCurrentCode, verifyCode };
