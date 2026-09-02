import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import patientsRouter from "./patients";
import appointmentsRouter from "./appointments";
import financialRouter from "./financial";
import servicesRouter from "./services";
import inventoryRouter from "./inventory";
import analyticsRouter from "./analytics";
import templatesRouter from "./templates";
import usersRouter from "./users";
import settingsRouter from "./settings";
import staffRouter from "./staff";
import tasksRouter from "./tasks";
import supabaseProxyRouter from "./supabase-proxy";
import uploadRouter from "./upload";
import clinicsRouter from "./clinics";
import authRouter, { authMiddleware } from "./auth";
import { publicContactRouter, contactMessagesRouter } from "./contact";
import { subscriptionGuard } from "../lib/clinic-status";

const router: IRouter = Router();

router.use(authRouter);
router.use(publicContactRouter);
router.use(authMiddleware);
router.use(subscriptionGuard);

router.use(healthRouter);
router.use(dashboardRouter);
router.use(patientsRouter);
router.use(appointmentsRouter);
router.use(financialRouter);
router.use(servicesRouter);
router.use(inventoryRouter);
router.use(analyticsRouter);
router.use(templatesRouter);
router.use(usersRouter);
router.use(settingsRouter);
router.use(staffRouter);
router.use(tasksRouter);
router.use(supabaseProxyRouter);
router.use(uploadRouter);
router.use(clinicsRouter);
router.use(contactMessagesRouter);

export default router;
