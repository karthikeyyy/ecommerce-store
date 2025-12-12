import CalendarEvent from "../models/CalendarEvent.js";

export const createCalendarEvent = async (req, res) => {
  try {
    const { date, title, description } = req.body;

    if (!date || !title) {
      return res.status(400).json({
        success: false,
        message: "Date and title are required",
      });
    }

    const event = await CalendarEvent.create({
      date,
      title,
      description,
      user: req.user ? req.user._id : null,
    });

    return res.status(201).json({
      success: true,
      event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getCalendarEvents = async (req, res) => {
  try {
    const events = await CalendarEvent.find().sort({
      date: 1,
      createdAt: 1,
    });

    return res.json({
      success: true,
      events,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const deleteCalendarEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.json({
      success: true,
      message: "Event deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
