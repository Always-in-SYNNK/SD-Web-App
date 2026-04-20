import {
    getNotificationsByUserId,
    readNotification,
    createNotification,
    notifyApplicationStatusChange,
    triggerUpcomingClosingDateNotifications,
} from "../services/notificationService.js";

export async function fetchNotifications(req, res, next) {
    try {
        const userId = req.user.id;
        const data = await getNotificationsByUserId(userId);

        res.json({
            success: true,
            notifications: data,
        });
    } catch (error) {
        console.error("fetchNotifications failed:", {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code,
            stack: error?.stack,
        });
        next(error);
    }
}

export async function updateNotification(req, res, next) {
    try {
        const notificationId = req.params.id;
        const userId = req.user.id;

        const updatedNotification = await readNotification(notificationId, userId);

        res.json({
            success: true,
            notification: updatedNotification,
        });
    } catch (error) {
        console.error("updateNotification failed:", {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code,
            stack: error?.stack,
        });
        next(error);
    }
}

/**
 * Manual creation endpoint for testing/admin use.
 * Not something frontend applicants should normally call directly.
 */
export async function createNotificationHandler(req, res, next) {
    try {
        const {
            applicantId,
            type,
            title,
            message,
            applicationId,
            opportunityId,
        } = req.body;

        const notification = await createNotification({
            applicantId,
            type,
            title,
            message,
            applicationId,
            opportunityId,
        });

        res.status(201).json({
            success: true,
            notification,
        });
    } catch (error) {
        console.error("createNotificationHandler failed:", {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code,
            stack: error?.stack,
        });
        next(error);
    }
}

/**
 * Manual trigger for application status change notification.
 * Useful while integrating provider/admin status updates.
 */
export async function triggerApplicationStatusNotification(req, res, next) {
    try {
        const {
            applicantId,
            applicationId,
            opportunityId,
            newStatus,
        } = req.body;

        const notification = await notifyApplicationStatusChange({
            applicantId,
            applicationId,
            opportunityId,
            newStatus,
        });

        res.status(201).json({
            success: true,
            notification,
        });
    } catch (error) {
        console.error("triggerApplicationStatusNotification failed:", {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code,
            stack: error?.stack,
        });
        next(error);
    }
}

/**
 * Manual trigger for closing soon reminders.
 * Later this can be called by a cron/scheduled job.
 */
export async function triggerClosingDateNotifications(req, res, next) {
    try {
        const daysAhead = req.body?.daysAhead ?? 3;

        const created = await triggerUpcomingClosingDateNotifications(daysAhead);

        res.status(201).json({
            success: true,
            count: created.length,
            notifications: created,
        });
    } catch (error) {
        console.error("triggerClosingDateNotifications failed:", {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code,
            stack: error?.stack,
        });
        next(error);
    }
}