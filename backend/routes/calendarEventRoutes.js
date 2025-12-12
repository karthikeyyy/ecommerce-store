import express from "express";
import {
  createCalendarEvent,
  getCalendarEvents,
  deleteCalendarEvent,
} from "../controllers/calendarEventController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router
  .route("/")
  .get(auth, getCalendarEvents)
  .post(auth, createCalendarEvent);

router
  .route("/:id")
  .delete(auth, deleteCalendarEvent);

export default router;
