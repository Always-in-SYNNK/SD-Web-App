import { jest } from "@jest/globals";

// Mock nodemailer
const mockSendMail = jest.fn();
const mockVerify = jest.fn();

jest.unstable_mockModule("nodemailer", () => ({
  default: {
    createTransport: jest.fn(() => ({
      sendMail: mockSendMail,
      verify: mockVerify,
    })),
  },
}));

// Import after mocking
const sendVerificationEmail = (
  await import("../src/services/emailService.js")
).default;
const { sendEmailNotification } = await import(
  "../src/services/emailService.js"
);

describe("emailService", () => {
  const mockEmail = "test@example.com";
  const mockToken = "test-verification-token";
  const mockName = "John Doe";

  beforeEach(() => {
    mockSendMail.mockReset();
    mockVerify.mockReset();
    process.env.EMAIL_USER = "test@gmail.com";
    process.env.EMAIL_PASS = "test-password";
    process.env.BASE_URL = "http://localhost:3000";
  });

  describe("sendVerificationEmail", () => {
    test("should send verification email successfully", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-123" });

      const result = await sendVerificationEmail(
        mockEmail,
        mockToken,
        mockName
      );

      expect(result.success).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"SA Learnerships Portal" <test@gmail.com>',
          to: mockEmail,
          subject: "Verify Your Email - SA Learnerships Portal",
          html: expect.stringContaining(mockName),
        })
      );
    });

    test("should include verification link in email", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-123" });

      await sendVerificationEmail(mockEmail, mockToken, mockName);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(
        `http://localhost:3000/verify-email?token=${mockToken}`
      );
    });

    test("should handle missing name", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-123" });

      const result = await sendVerificationEmail(mockEmail, mockToken);

      expect(result.success).toBe(true);
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain("Hello there");
    });

    test("should throw error when sending fails", async () => {
      const error = new Error("SMTP connection failed");
      mockSendMail.mockRejectedValueOnce(error);

      await expect(
        sendVerificationEmail(mockEmail, mockToken, mockName)
      ).rejects.toThrow("SMTP connection failed");
    });

    test("should use custom BASE_URL from environment", async () => {
      process.env.BASE_URL = "https://custom-domain.com";
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-123" });

      await sendVerificationEmail(mockEmail, mockToken, mockName);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(
        "https://custom-domain.com/verify-email?token="
      );
    });
  });

  describe("sendEmailNotification", () => {
    const mockNotificationData = {
      to: mockEmail,
      name: mockName,
      type: "new_opportunity",
      title: "New Opportunity Available",
      message: "A new software developer opportunity has been posted.",
    };

    test("should send notification email successfully", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-456" });

      const result = await sendEmailNotification(mockNotificationData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("msg-456");
      expect(mockSendMail).toHaveBeenCalledTimes(1);
    });

    test("should send email with correct subject", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-456" });

      await sendEmailNotification(mockNotificationData);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.subject).toBe("New Opportunity Available");
    });

    test("should include notification message in email", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-456" });

      await sendEmailNotification(mockNotificationData);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(
        "A new software developer opportunity has been posted."
      );
    });

    test("should handle new_opportunity notification type", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-456" });

      await sendEmailNotification(mockNotificationData);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain("🎉");
    });

    test("should handle 7_day_reminder notification type", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-456" });

      const reminderData = {
        ...mockNotificationData,
        type: "7_day_reminder",
      };
      await sendEmailNotification(reminderData);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain("⏰");
    });

    test("should handle 24_hour_reminder notification type", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-456" });

      const reminderData = {
        ...mockNotificationData,
        type: "24_hour_reminder",
      };
      await sendEmailNotification(reminderData);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain("⚠️");
    });

    test("should include user name in email content", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-456" });

      await sendEmailNotification(mockNotificationData);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(`Hello ${mockName}`);
    });

    test("should return error when email not configured", async () => {
      delete process.env.EMAIL_USER;

      const result = await sendEmailNotification(mockNotificationData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Email not configured");
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    test("should return error when EMAIL_PASS not configured", async () => {
      delete process.env.EMAIL_PASS;

      const result = await sendEmailNotification(mockNotificationData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Email not configured");
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    test("should handle send failure gracefully", async () => {
      mockSendMail.mockRejectedValueOnce(
        new Error("Network connection failed")
      );

      const result = await sendEmailNotification(mockNotificationData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network connection failed");
    });

    test("should use correct sender email", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-456" });

      await sendEmailNotification(mockNotificationData);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.from).toContain("test@gmail.com");
    });

    test("should include preferences management link", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-456" });

      await sendEmailNotification(mockNotificationData);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain("/settings/notifications");
    });

    test("should handle missing metadata gracefully", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-456" });

      const dataWithoutMetadata = { ...mockNotificationData };
      delete dataWithoutMetadata.metadata;

      const result = await sendEmailNotification(dataWithoutMetadata);

      expect(result.success).toBe(true);
    });
  });
});
