import { NextFunction, Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    try {
        console.log("Verifying Logic");
        const idToken = req.headers.authorization;
        console.log(idToken);
        if (idToken) {
            getAuth().verifyIdToken(idToken).then(
                () => {
                    console.log("Valid Token");
                    next();
                }
            )
            .catch((error) => {
                res.status(401).json(error);
            });
        } else {
            res.status(401).json("Unauthorized");
        }
    } catch (error) {
        res.status(500).json(error);
    }
};

export { verifyToken };
