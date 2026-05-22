import { jest } from "@jest/globals";

// Mock nodemailer with proper implementation
const mockSendMail = jest.fn();
const mockVerify = jest.fn();
let mockTransporter = null;

jest.unstable_mockModule("nodemailer", () => ({
  default: {
    createTransport: jest.fn(() => {
      mockTransporter = {
        sendMail: mockSendMail,
        verify: mockVerify,
      };
      return mockTransporter;
    }),
  },
}));

// Import after mocking
let sendVerificationEmail, sendEmailNotification, isEmailConfigured;

beforeEach(async () => {
  jest.resetModules();
  process.env.EMAIL_USER = "test@gmail.com";
  process.env.EMAIL_PASS = "test-password";
  process.env.BASE_URL = "http://localhost:3000";
  process.env.FRONTEND_URL = "http://localhost:5173";
  process.env.NODE_ENV = "test";

  const module = await import("../src/services/emailService.js");
  sendVerificationEmail = module.default;
  sendEmailNotification = module.sendEmailNotification;
  isEmailConfigured = module.isEmailConfigured;
});

describe("emailService", () => {
  const mockEmail = "test@example.com";
  const mockToken = "test-verification-token";
  const mockName = "John Doe";

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMail.mockReset();
    mockVerify.mockReset();
  });

  afterEach(() => {
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;
    delete process.env.BASE_URL;
    delete process.env.FRONTEND_URL;
  });

  describe("sendVerificationEmail", () => {
    test("should send verification email successfully", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-123" });
      mockVerify.mockImplementationOnce((callback) => callback(null, true));

      const result = await sendVerificationEmail(mockEmail, mockToken, mockName);

      expect(result.success).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining("test@gmail.com"),
          to: mockEmail,
          subject: "Verify Your Email - SA Learnerships Portal",
          html: expect.stringContaining(mockName),
        })
      );
    });

    test("should include verification link in email", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-123" });
      mockVerify.mockImplementationOnce((callback) => callback(null, true));

      await sendVerificationEmail(mockEmail, mockToken, mockName);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(`verify-email?token=${mockToken}`);
    });

    test("should handle missing name", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-123" });
      mockVerify.mockImplementationOnce((callback) => callback(null, true));

      const result = await sendVerificationEmail(mockEmail, mockToken);

      expect(result.success).toBe(true);
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain("Hello there");
    });

    test("should throw error when sending fails after retries", async () => {
      const error = new Error("SMTP connection failed");
      mockSendMail.mockRejectedValue(error);
      mockVerify.mockImplementationOnce((callback) => callback(null, true));

      await expect(sendVerificationEmail(mockEmail, mockToken, mockName)).rejects.toThrow(
        "SMTP connection failed"
      );

      expect(mockSendMail).toHaveBeenCalledTimes(3);
    });

    test("should use FRONTEND_URL from environment for verification link", async () => {
      process.env.FRONTEND_URL = "https://myapp.netlify.app";
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-123" });
      mockVerify.mockImplementationOnce((callback) => callback(null, true));

      await sendVerificationEmail(mockEmail, mockToken, mockName);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain("https://myapp.netlify.app/verify-email?token=");
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

    beforeEach(() => {
      mockVerify.mockImplementationOnce((callback) => callback(null, true));
    });

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
      expect(callArgs.html).toContain("A new software developer opportunity has been posted.");
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

      const { sendEmailNotification: sendEmailNotifWithoutConfig } = await import(
        "../src/services/emailService.js"
      );

      const result = await sendEmailNotifWithoutConfig(mockNotificationData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    test("should return error when EMAIL_PASS not configured", async () => {
      delete process.env.EMAIL_PASS;

      const { sendEmailNotification: sendEmailNotifWithoutPass } = await import(
        "../src/services/emailService.js"
      );

      const result = await sendEmailNotifWithoutPass(mockNotificationData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    test("should handle send failure gracefully with retries", async () => {
      mockSendMail.mockRejectedValue(new Error("Network connection failed"));

      const result = await sendEmailNotification(mockNotificationData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network connection failed");
      expect(mockSendMail).toHaveBeenCalledTimes(3);
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

    test("should handle matching_opportunity notification type", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "msg-456" });

      const matchingData = {
        ...mockNotificationData,
        type: "matching_opportunity",
        title: "New Matching Opportunity Found! 🎯",
      };
      await sendEmailNotification(matchingData);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain("🎯");
    });
  });
});