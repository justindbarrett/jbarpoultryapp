import { Response } from "express";
import { db } from "./config/firebase";

type UserRole = "service" | "admin" | "inspector";

type UserDataType = {
    userId: string;
    initials: string[];
    role: UserRole;
};

type UserType = {
    id: string;
    userId: string;
    initials: string[];
    role: UserRole;
};

type CreateUserRequest = {
    body: UserDataType;
    params: { id: string };
};

type UpdateUserRequest = {
    body: Partial<UserDataType>;
    params: { id: string };
};

const userCollectionPath = "users";

const createUserDocument = async (userData: UserDataType): Promise<UserType> => {
    const { userId, initials, role } = userData;
    
    const userDocument = await db.collection(userCollectionPath).doc();
    const user: UserType = {
        id: userDocument.id,
        userId: userId,
        initials: initials || [],
        role: role,
    };
    
    await userDocument.set(user);
    
    return user;
};

const addUser = async (req: CreateUserRequest, res: Response) => {
    try {
        const userData = req.body;
        
        if (!userData.userId || !userData.role) {
            return res.status(400).json({
                status: "error",
                message: "userId and role are required",
            });
        }

        if (!["service", "admin", "inspector"].includes(userData.role)) {
            return res.status(400).json({
                status: "error",
                message: "role must be one of: service, admin, inspector",
            });
        }
        
        const user = await createUserDocument(userData);
        
        return res.status(200).json({
            status: "success",
            message: "User added successfully",
            data: user,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

const getUsers = async (req: any, res: Response) => {
    try {
        const allUsers: UserType[] = [];
        const querySnapshot = await db.collection(userCollectionPath).get();
        querySnapshot.forEach((doc: any) => allUsers.push(doc.data()));
        
        return res.status(200).json({
            status: "success",
            data: allUsers,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

const getUser = async (req: any, res: Response) => {
    try {
        const userId = req.params.id;
        const userDoc = await db.collection(userCollectionPath).doc(userId).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }
        
        return res.status(200).json({
            status: "success",
            data: userDoc.data(),
        });
    } catch (error: any) {
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

const getUserByUserId = async (req: any, res: Response) => {
    try {
        const userId = req.params.userId;
        const querySnapshot = await db.collection(userCollectionPath)
            .where("userId", "==", userId)
            .get();
        
        if (querySnapshot.empty) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }
        
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        return res.status(200).json({
            status: "success",
            data: { ...userData, id: userDoc.id },
        });
    } catch (error: any) {
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

const updateUser = async (req: UpdateUserRequest, res: Response) => {
    try {
        const id = req.params.id;
        const updates = req.body;
        
        if (updates.role && !["service", "admin", "inspector"].includes(updates.role)) {
            return res.status(400).json({
                status: "error",
                message: "role must be one of: service, admin, inspector",
            });
        }
        
        const userRef = db.collection(userCollectionPath).doc(id);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }
        
        await userRef.update(updates);
        
        const updatedUserDoc = await userRef.get();
        
        return res.status(200).json({
            status: "success",
            message: "User updated successfully",
            data: updatedUserDoc.data(),
        });
    } catch (error: any) {
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

const deleteUser = async (req: any, res: Response) => {
    try {
        const id = req.params.id;
        
        const userRef = db.collection(userCollectionPath).doc(id);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }
        
        await userRef.delete();
        
        return res.status(200).json({
            status: "success",
            message: "User deleted successfully",
        });
    } catch (error: any) {
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

export {
    addUser,
    getUsers,
    getUser,
    getUserByUserId,
    updateUser,
    deleteUser,
};
