const AIController = require("../../controllers/aiController");

describe("AIController Gemini error handling", () => {
  const controller = new AIController();

  it("should detect Gemini 429 errors from status", () => {
    expect(
      controller.isGeminiRateLimitError({
        status: 429,
        message: "Too Many Requests",
      })
    ).toBe(true);
  });

  it("should detect Gemini quota errors from SDK codes", () => {
    expect(
      controller.isGeminiRateLimitError({
        code: "RESOURCE_EXHAUSTED",
        message: "Quota exceeded",
      })
    ).toBe(true);
  });

  it("should return a dedicated response for rate limit errors", () => {
    const response = controller.getGeminiErrorResponse({
      status: 429,
      message: "Too Many Requests",
    });

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 503,
        code: "AI_RATE_LIMIT_EXCEEDED",
        isRateLimit: true,
      })
    );
    expect(response.message).toContain("GEMINI_API_KEY");
  });

  it("should return timeout response for Gemini timeout errors", () => {
    const response = controller.getGeminiErrorResponse({
      message: "Gemini API timeout",
    });

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 503,
        code: "AI_TIMEOUT",
        isRateLimit: false,
      })
    );
  });

  it("should normalize invoice items into transaction payloads", () => {
    const items = controller.normalizeInvoiceItems(
      {
        merchantName: "EVN",
        invoiceDate: "2026-06-01",
        items: [
          { name: "Tiền điện", amount: "120000", categoryGuess: "Hóa đơn" },
          { description: "Tiền nước", amount: 80000, type: "CHITIEU" },
        ],
      },
      "Hóa đơn điện nước"
    );

    expect(items).toHaveLength(2);
    expect(items[0]).toEqual(
      expect.objectContaining({
        name: "Tiền điện",
        amount: 120000,
        type: "CHITIEU",
        categoryGuess: "Hóa đơn",
      })
    );
    expect(items[1]).toEqual(
      expect.objectContaining({
        name: "Tiền nước",
        amount: 80000,
        type: "CHITIEU",
        categoryGuess: "EVN",
      })
    );
  });

  it("should recognize supported invoice upload mime types", () => {
    expect(controller.isSupportedInvoiceMimeType("image/png")).toBe(true);
    expect(controller.isSupportedInvoiceMimeType("application/pdf")).toBe(true);
    expect(controller.isSupportedInvoiceMimeType("text/plain")).toBe(false);
  });

  it("should build an invoice extraction prompt", () => {
    const prompt = controller.buildInvoicePrompt(
      "Đây là hóa đơn điện nước",
      {
        categories: [{ name: "Hóa đơn", type: "CHITIEU" }],
        accounts: [{ name: "Tiền mặt", type: "TIENMAT" }],
        currentDate: "2026-06-01",
      },
      "invoice.pdf"
    );

    expect(prompt).toContain("IMPORT_INVOICE");
    expect(prompt).toContain("invoice.pdf");
    expect(prompt).toContain("Đây là hóa đơn điện nước");
  });

  it("should auto import invoice items through transaction handler", async () => {
    const mockController = new AIController();
    mockController.transactionHandler = {
      createTransactionInDB: jest.fn(async (payload) => ({
        _id: `${payload.name}-id`,
        ...payload,
      })),
    };

    const result = await mockController.handleInvoiceImport(
      {
        originalMessage: "Hóa đơn điện nước",
        invoice: {
          merchantName: "EVN",
          invoiceDate: "2026-06-01",
          items: [
            { name: "Tiền điện", amount: 120000, categoryGuess: "Hóa đơn" },
            { name: "Tiền nước", amount: 80000, categoryGuess: "Hóa đơn" },
          ],
        },
      },
      "user-1"
    );

    expect(mockController.transactionHandler.createTransactionInDB).toHaveBeenCalledTimes(
      2
    );
    expect(result).toEqual(
      expect.objectContaining({
        action: "AUTO_IMPORT_INVOICE",
      })
    );
    expect(result.data.transactions).toHaveLength(2);
    expect(result.response).toContain("Đã tự động nhập 2/2");
  });
});