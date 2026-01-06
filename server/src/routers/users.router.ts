import { Router, type Request, type Response } from "express";
import { signin, signup, me } from "../controllers/users.controller.js";

const router = Router();

router.get("/test", (req: Request, res: Response) => res.send("Hello WOrld"));
router.post("/signin", signin);
router.post("/signup", signup);
router.get("/me", me);

export default router;
