// backend/controllers/aiController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Import handlers
const AccountHandler = require("./aiHandlers/accountHandler");
const TransactionHandler = require("./aiHandlers/transactionHandler");
const GoalHandler = require("./aiHandlers/goalHandler");
const CategoryHandler = require("./aiHandlers/categoryHandler");
const UtilsHelper = require("./aiHandlers/utilsHelper");

// --- PHẦN NÂNG CẤP: KHỞI TẠO GEMINI ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
// --- KẾT THÚC PHẦN NÂNG CẤP ---

class AIController {
  constructor() {
    // Lưu trạng thái conversation theo userId
    this.conversationStates = new Map();

    // Khởi tạo handlers
    this.accountHandler = new AccountHandler();
    this.transactionHandler = new TransactionHandler();
    this.goalHandler = new GoalHandler();
    this.categoryHandler = new CategoryHandler();
    this.utilsHelper = new UtilsHelper();
  }

  isGeminiRateLimitError(error) {
    const status = error?.status ?? error?.response?.status;
    const code = error?.code;
    const message = `${error?.message ?? ""} ${error?.statusText ?? ""} ${
      error?.error?.message ?? ""
    } ${error?.error?.status ?? ""}`.toLowerCase();

    return (
      status === 429 ||
      code === 429 ||
      code === "429" ||
      code === "RESOURCE_EXHAUSTED" ||
      code === "RATE_LIMIT_EXCEEDED" ||
      message.includes("429") ||
      message.includes("too many requests") ||
      message.includes("resource exhausted") ||
      message.includes("rate limit") ||
      message.includes("quota") ||
      message.includes("exceeded")
    );
  }

  getGeminiErrorResponse(error) {
    if (this.isGeminiRateLimitError(error)) {
      return {
        statusCode: 503,
        message:
          "Gemini đang bị giới hạn quota/rate limit. Hãy đổi GEMINI_API_KEY hoặc chờ quota được reset.",
        code: "AI_RATE_LIMIT_EXCEEDED",
        isRateLimit: true,
      };
    }

    if (error?.message === "Gemini API timeout") {
      return {
        statusCode: 503,
        message: "Dịch vụ AI đang quá tải, vui lòng thử lại sau",
        code: "AI_TIMEOUT",
        isRateLimit: false,
      };
    }

    if (error?.code === "ENOTFOUND" || error?.code === "ECONNREFUSED") {
      return {
        statusCode: 503,
        message: "Không thể kết nối đến dịch vụ AI",
        code: "AI_CONNECTION_ERROR",
        isRateLimit: false,
      };
    }

    return {
      statusCode: 500,
      message: "Lỗi server khi xử lý yêu cầu AI",
      code: "AI_INTERNAL_ERROR",
      isRateLimit: false,
    };
  }

  // Lấy conversation state của user
  getConversationState(userId) {
    if (!this.conversationStates.has(userId)) {
      this.conversationStates.set(userId, {
        waitingFor: null, // 'goal_amount', 'goal_deadline', 'transaction_amount', etc.
        pendingData: {}, // Dữ liệu đang chờ hoàn thiện
        lastIntent: null,
        conversationHistory: [],
      });
    }
    return this.conversationStates.get(userId);
  }

  // Cập nhật conversation state
  updateConversationState(userId, updates) {
    const state = this.getConversationState(userId);
    Object.assign(state, updates);
    this.conversationStates.set(userId, state);
  }

  // Reset conversation state
  resetConversationState(userId) {
    this.conversationStates.delete(userId);
  }

  isInvoiceImportMessage(message) {
    const lowerMessage = `${message || ""}`.toLowerCase();
    return /hóa đơn|hoa don|invoice|receipt|bill|biên lai|phieu thu|phieu chi/.test(
      lowerMessage
    );
  }

  isSupportedInvoiceMimeType(mimeType) {
    return [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ].includes(mimeType);
  }

  normalizeInvoiceItems(invoice = {}, originalMessage = "") {
    const items = Array.isArray(invoice.items) ? invoice.items : [];
    const fallbackDate =
      invoice.invoiceDate ||
      invoice.date ||
      new Date().toISOString().split("T")[0];

    return items
      .map((item, index) => ({
        name: item?.name || item?.description || `Hóa đơn mục ${index + 1}`,
        amount: Number(item?.amount),
        type: item?.type || invoice.type || "CHITIEU",
        categoryGuess:
          item?.categoryGuess || invoice.categoryGuess || invoice.merchantName || "Hóa đơn",
        accountGuess: item?.accountGuess || invoice.accountGuess || null,
        date: item?.date || fallbackDate,
        note:
          item?.note ||
          invoice.merchantName ||
          invoice.invoiceNumber ||
          originalMessage ||
          "",
      }))
      .filter((item) => item.name && Number.isFinite(item.amount) && item.amount > 0);
  }

  buildInvoicePrompt(userMessage, userContext, fileName = "") {
    const { categories, accounts, currentDate } = userContext;

    const categoryList =
      categories && categories.length > 0
        ? categories.map((c) => `"${c.name}" (${c.type})`).join(", ")
        : "";
    const accountList =
      accounts && accounts.length > 0
        ? accounts
            .map(
              (a) =>
                `"${a.name}" (${a.type}${a.bankName ? `, ${a.bankName}` : ""})`
            )
            .join(", ")
        : "";

    return `
SYSTEM: Bạn là AI assistant chuyên tách hóa đơn thành các khoản thu/chi để tự động nhập vào ứng dụng tài chính.

### THÔNG TIN NGƯỜI DÙNG HIỆN TẠI
- Ngày hiện tại: ${currentDate}
- Danh mục có sẵn: ${categoryList || "Chưa có danh mục nào"}
- Tài khoản có sẵn: ${accountList || "Chưa có tài khoản nào"}
- Tên file: ${fileName || "Không có"}

### YÊU CẦU BỔ SUNG TỪ NGƯỜI DÙNG
"${userMessage || ""}"

### NHIỆM VỤ
- Đọc nội dung hóa đơn từ file ảnh hoặc PDF.
- Xác định đây là hóa đơn/biên lai và tách thành nhiều khoản thu/chi nếu có nhiều dòng.
- Nếu chỉ có 1 khoản thì vẫn trả về 1 item trong mảng items.
- Dùng tiếng Việt ngắn gọn, tập trung vào dữ liệu cấu trúc.
- Ưu tiên categoryGuess phù hợp như: Hóa đơn, Điện, Nước, Internet, Ăn uống, Mua sắm, Xăng xe.
- Nếu không chắc accountGuess thì để null.

### FORMAT JSON BẮT BUỘC
{
  "intent": "IMPORT_INVOICE",
  "entities": {
    "categoryFilter": null,
    "timeFilter": null,
    "amountFilter": null,
    "searchTerm": null,
    "typeFilter": "CHITIEU",
    "statusFilter": null,
    "monthCount": null,
    "specificAccount": null,
    "bankFilter": null
  },
  "invoice": {
    "merchantName": "tên cửa hàng/đơn vị phát hành hoặc null",
    "invoiceNumber": "số hóa đơn hoặc null",
    "invoiceDate": "YYYY-MM-DD hoặc null",
    "totalAmount": số hoặc null,
    "autoImport": true,
    "items": [
      {
        "name": "tên khoản chi/thu",
        "amount": số,
        "type": "CHITIEU hoặc THUNHAP",
        "categoryGuess": "danh mục gợi ý hoặc null",
        "accountGuess": "tài khoản gợi ý hoặc null",
        "note": "ghi chú ngắn hoặc null"
      }
    ]
  },
  "transaction": null,
  "category": null,
  "account": null,
  "goal": null,
  "responseForUser": "Đã tách được hóa đơn thành các khoản chi/thu"
}
    `;
  }

  async handleInvoiceImport(aiResponse, userId) {
    const invoice = aiResponse.invoice || {};
    const items = this.normalizeInvoiceItems(
      invoice,
      aiResponse.originalMessage || ""
    );

    if (items.length === 0) {
      return {
        response:
          "Tôi nhận ra đây là hóa đơn nhưng chưa tách được các dòng chi tiết. Bạn hãy gửi lại rõ hơn hoặc dán nội dung hóa đơn đầy đủ hơn.",
        action: "CHAT_RESPONSE",
      };
    }

    const createdTransactions = [];
    const errors = [];

    for (const item of items) {
      try {
        const createdTransaction = await this.transactionHandler.createTransactionInDB({
          ...item,
          userId,
        });
        createdTransactions.push(createdTransaction);
      } catch (error) {
        console.error("Invoice item import failed:", item, error);
        errors.push(`${item.name}: ${error.message}`);
      }
    }

    const summary = invoice.merchantName
      ? `hóa đơn ${invoice.merchantName}`
      : "hóa đơn";

    return {
      response: `Đã tự động nhập ${createdTransactions.length}/${items.length} khoản từ ${summary}.`,
      action: "AUTO_IMPORT_INVOICE",
      data: {
        invoice,
        transactions: createdTransactions.map((transaction) => ({
          id: transaction._id,
          name: transaction.name,
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
        })),
        errors,
      },
    };
  }

  async callGeminiInvoiceOptimized(prompt, file, maxRetries = 2) {
    const filePart = {
      inlineData: {
        mimeType: file.mimetype,
        data: file.buffer.toString("base64"),
      },
    };

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Invoice extraction attempt ${attempt}/${maxRetries}`);

        const result = await Promise.race([
          model.generateContent([{ text: prompt }, filePart]),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Gemini API timeout")), 15000)
          ),
        ]);

        return result;
      } catch (error) {
        console.error(`Invoice attempt ${attempt} failed:`, error.message);

        if (this.isGeminiRateLimitError(error) || attempt === maxRetries) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  async processInvoiceUpload(req, res) {
    try {
      const userId = req.user?.id;
      const { message = "" } = req.body;
      const file = req.file;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Người dùng chưa đăng nhập",
        });
      }

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng chọn ảnh hoặc PDF hóa đơn",
        });
      }

      if (!this.isSupportedInvoiceMimeType(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Chỉ hỗ trợ ảnh JPG/PNG/WebP hoặc file PDF",
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          success: false,
          message: "Dịch vụ AI chưa được cấu hình",
        });
      }

      const userContext = await this.utilsHelper.getUserContext(userId);
      const prompt = this.buildInvoicePrompt(
        message.trim(),
        userContext,
        file.originalname
      );

      const result = await this.callGeminiInvoiceOptimized(prompt, file, 2);
      const responseText = await result.response.text();

      let aiResponse;
      try {
        aiResponse = this.utilsHelper.parseGeminiResponse(responseText);
        aiResponse.originalMessage = message || file.originalname;
      } catch (parseError) {
        console.error("Invoice JSON Parse Error:", parseError);
        console.error("Invoice response text:", responseText);

        return res.status(500).json({
          success: false,
          message:
            "Không thể đọc hóa đơn từ file. Vui lòng thử lại với ảnh rõ hơn hoặc PDF đầy đủ hơn.",
        });
      }

      if (!aiResponse.intent) {
        aiResponse.intent = "IMPORT_INVOICE";
      }

      const finalResponse = await this.handleAIResponse(aiResponse, userId);

      return res.json({
        success: true,
        ...finalResponse,
      });
    } catch (error) {
      console.error("Invoice upload error:", error);

      const geminiErrorResponse = this.getGeminiErrorResponse(error);
      return res.status(geminiErrorResponse.statusCode).json({
        success: false,
        message: geminiErrorResponse.message,
        code: geminiErrorResponse.code,
        isRateLimit: geminiErrorResponse.isRateLimit,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // --- HÀM PROCESSMESSAGE ĐÃ ĐƯỢC NÂNG CẤP HOÀN TOÀN ---
  async processMessage(req, res) {
    try {
      console.log("=== STARTING AI PROCESS MESSAGE ===");
      console.log("Request body:", req.body);
      console.log("User ID:", req.user?.id);

      const { message } = req.body;
      const userId = req.user.id;

      // Validate input
      if (
        !message ||
        typeof message !== "string" ||
        message.trim().length === 0
      ) {
        console.log("Invalid message:", message);
        return res.status(400).json({
          success: false,
          message: "Tin nhắn không hợp lệ hoặc rỗng",
        });
      }

      if (!userId) {
        console.log("User ID not found");
        return res.status(401).json({
          success: false,
          message: "Người dùng chưa đăng nhập",
        });
      }

      // Check API key
      if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY not found in environment variables");
        return res.status(500).json({
          success: false,
          message: "Dịch vụ AI chưa được cấu hình",
        });
      }

      console.log("Getting user context for userId:", userId);

      // Lấy conversation state
      const conversationState = this.getConversationState(userId);
      console.log("=== CONVERSATION STATE ===");
      console.log("Waiting for:", conversationState.waitingFor);
      console.log("Pending data:", conversationState.pendingData);
      console.log("Last intent:", conversationState.lastIntent);
      console.log("=== END CONVERSATION STATE ===");

      // Kiểm tra nếu đang chờ thông tin bổ sung
      if (conversationState.waitingFor) {
        console.log("Handling follow-up response...");
        const followUpResult = await this.handleFollowUpResponse(
          message.trim(),
          userId,
          conversationState
        );
        return res.json({
          success: true,
          ...followUpResult,
        });
      }

      // Kiểm tra local patterns trước khi gọi Gemini API
      const localResponse = await this.tryLocalProcessing(
        message.trim(),
        userId
      );
      if (localResponse) {
        console.log("Handled locally without Gemini API");
        return res.json({
          success: true,
          ...localResponse,
        });
      }

      // Lấy dữ liệu user để cung cấp context cho AI
      const userContext = await this.utilsHelper.getUserContext(userId);

      console.log("=== USER CONTEXT SUMMARY ===");
      console.log("Categories:", userContext.categories.length);
      console.log("Accounts:", userContext.accounts.length);
      console.log(
        "Recent transactions:",
        userContext.recentTransactions.length
      );
      console.log("=== END USER CONTEXT SUMMARY ===");

      // Sử dụng optimized Gemini call với system instructions
      console.log("=== CALLING OPTIMIZED GEMINI API ===");

      // Gọi Gemini API tối ưu
      const result = await this.callGeminiOptimized(
        message.trim(),
        userContext,
        3
      );

      const responseText = await result.response.text();

      console.log("=== GEMINI RAW RESPONSE ===");
      console.log("Response length:", responseText.length);
      console.log(
        "Response content (first 500 chars):",
        responseText.substring(0, 500)
      );
      console.log("=== END GEMINI RAW RESPONSE ===");

      // Parse kết quả JSON từ Gemini với xử lý lỗi nâng cao
      let aiResponse;
      try {
        aiResponse = this.utilsHelper.parseGeminiResponse(responseText);
        aiResponse.originalMessage = message; // Thêm originalMessage để dùng cho extract date
        console.log("=== PARSED AI RESPONSE ===");
        console.log(JSON.stringify(aiResponse, null, 2));
        console.log("=== END PARSED RESPONSE ===");
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Response text:", responseText);

        // Fallback response nếu không parse được
        aiResponse = {
          intent: "UNKNOWN",
          responseForUser:
            "Xin lỗi, tôi không hiểu yêu cầu của bạn. Bạn có thể nói rõ hơn không?",
          transaction: null,
          category: null,
          goal: null,
        };
      }

      // Xử lý logic dựa trên intent Gemini trả về
      if (aiResponse.intent === "IMPORT_INVOICE") {
        aiResponse.originalMessage = message;
      }

      const finalResponse = await this.handleAIResponse(aiResponse, userId);

      console.log("=== FINAL RESPONSE TO CLIENT ===");
      console.log(JSON.stringify(finalResponse, null, 2));
      console.log("=== END FINAL RESPONSE ===");

      res.json({
        success: true,
        ...finalResponse,
      });
    } catch (error) {
      console.error("AI Controller Error:", error);

      // Differentiate error types
      let errorMessage = "Lỗi server khi xử lý yêu cầu AI";
      let statusCode = 500;

      const geminiErrorResponse = this.getGeminiErrorResponse(error);
      errorMessage = geminiErrorResponse.message;
      statusCode = geminiErrorResponse.statusCode;

      if (geminiErrorResponse.isRateLimit) {
        console.error(
          "Gemini rate limit detected. Consider rotating GEMINI_API_KEY."
        );

        // Thử xử lý local fallback
        try {
          const fallbackResponse = await this.tryLocalProcessing(
            req.body.message,
            req.user.id
          );
          if (fallbackResponse) {
            return res.json({
              success: true,
              ...fallbackResponse,
            });
          }
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
        }
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        code: geminiErrorResponse.code,
        isRateLimit: geminiErrorResponse.isRateLimit,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // --- HÀM XỬ LÝ RESPONSE CẢI TIẾN ---
  async handleAIResponse(aiResponse, userId) {
    const { intent, transaction, category, goal, responseForUser, entities } =
      aiResponse;

    console.log("=== HANDLING AI RESPONSE ===");
    console.log("Intent:", intent);
    console.log("Entities:", JSON.stringify(entities, null, 2));
    console.log("Transaction data:", transaction);
    console.log("Category data:", category);
    console.log("Goal data:", goal);

    switch (intent) {
      case "ADD_TRANSACTION":
        return await this.transactionHandler.handleAddTransaction(
          transaction,
          userId,
          responseForUser,
          aiResponse.originalMessage || ""
        );

      case "IMPORT_INVOICE":
        return await this.handleInvoiceImport(aiResponse, userId);

      case "ADD_CATEGORY":
        return await this.categoryHandler.handleAddCategory(
          category,
          userId,
          responseForUser
        );

      case "ADD_ACCOUNT":
        return await this.accountHandler.handleAddAccount(
          aiResponse.account,
          userId,
          responseForUser
        );

      case "ADD_GOAL":
        return await this.goalHandler.handleAddGoal(
          goal,
          userId,
          responseForUser
        );

      case "COMPARE_EXPENSES":
      

      case "QUICK_STATS":
        // For QUICK_STATS từ Gemini, sử dụng timeFilter từ entities
        const timeFilter = entities?.timeFilter;
        return await this.utilsHelper.getQuickStatsWithFilter(
          userId,
          timeFilter
        );

      case "COMPARE_MONTHS":
        console.log("Handling COMPARE_MONTHS intent");
        const monthCount = entities?.monthCount || 3;
        return await this.utilsHelper.compareMonths(userId, monthCount);

      case "ANALYZE_FINANCES":
        console.log("Handling ANALYZE_FINANCES intent");
        return await this.utilsHelper.analyzeFinancialHealth(userId);

      case "VIEW_ACCOUNTS":
        // Xem danh sách tài khoản với filter từ entities
        return await this.accountHandler.getAccountListWithFilter(
          userId,
          entities
        );

      case "VIEW_TRANSACTIONS":
        // Xem giao dịch với filter từ entities
        return await this.transactionHandler.getTransactionsWithFilter(
          userId,
          entities,
          responseForUser
        );

      case "VIEW_CATEGORIES":
        // Xem danh mục với filter từ entities
        return await this.categoryHandler.getCategoryListWithFilter(
          userId,
          entities
        );

      case "VIEW_GOALS":
        // Xem mục tiêu với filter từ entities
        return await this.goalHandler.getGoalListWithFilter(userId, entities);

      case "QUERY_TRANSACTIONS":
        return await this.transactionHandler.handleQueryTransactionsWithFilter(
          userId,
          entities,
          responseForUser
        );

      default:
        return {
          response:
            responseForUser ||
            "Xin lỗi, tôi chưa hiểu yêu cầu của bạn. Bạn có thể nói rõ hơn không?",
          action: "CHAT_RESPONSE",
        };
    }
  }

  // Xử lý response follow-up khi đang chờ thông tin
  async handleFollowUpResponse(message, userId, conversationState) {
    const { waitingFor, pendingData, lastIntent } = conversationState;

    console.log("=== HANDLING FOLLOW-UP ===");
    console.log("Message:", message);
    console.log("Waiting for:", waitingFor);
    console.log("Pending data:", pendingData);

    try {
      if (waitingFor === "transaction_amount") {
        // Trích xuất số tiền từ message
        const amount = this.utilsHelper.extractAmount(message);
        if (amount) {
          // Reset conversation state
          this.resetConversationState(userId);

          // Tạo transaction object hoàn chỉnh
          const completeTransaction = {
            ...pendingData,
            amount: amount,
          };

          return await this.transactionHandler.handleAddTransaction(
            completeTransaction,
            userId,
            `Đã cập nhật số tiền ${amount.toLocaleString()}đ cho giao dịch.`,
            pendingData.originalMessage || ""
          );
        } else {
          return {
            response:
              "Tôi không hiểu số tiền bạn vừa nhập. Vui lòng nhập lại, ví dụ: '50000' hoặc '50k' hoặc '0.5 triệu'",
            action: "CHAT_RESPONSE",
          };
        }
      }

      if (waitingFor === "goal_amount") {
        const amount = this.utilsHelper.extractAmount(message);
        if (amount) {
          // Cập nhật pending data với amount
          const updatedPendingData = {
            ...pendingData,
            targetAmount: amount,
          };

          // Kiểm tra xem có cần deadline không
          if (!updatedPendingData.deadline) {
            this.updateConversationState(userId, {
              waitingFor: "goal_deadline",
              pendingData: updatedPendingData,
            });

            return {
              response: `Mục tiêu ${amount.toLocaleString()}đ cho "${
                updatedPendingData.name
              }". Bạn muốn hoàn thành vào lúc nào? (Ví dụ: "tháng 12 2025", "cuối năm", "31/12/2025")`,
              action: "CHAT_RESPONSE",
            };
          } else {
            // Có đầy đủ thông tin, tạo goal
            this.resetConversationState(userId);
            return await this.goalHandler.handleAddGoal(
              updatedPendingData,
              userId,
              null
            );
          }
        } else {
          return {
            response:
              "Tôi không hiểu số tiền bạn vừa nhập. Vui lòng nhập lại, ví dụ: '5 triệu' hoặc '5000000đ'",
            action: "CHAT_RESPONSE",
          };
        }
      }

      if (waitingFor === "goal_deadline") {
        const extractedDate = this.goalHandler.extractDate(message);
        if (extractedDate) {
          // Reset conversation state
          this.resetConversationState(userId);

          // Tạo goal object hoàn chỉnh
          const completeGoal = {
            ...pendingData,
            deadline: extractedDate.toISOString().split("T")[0], // Format YYYY-MM-DD
          };

          return await this.goalHandler.handleAddGoal(
            completeGoal,
            userId,
            `Đã cập nhật hạn cuối: ${extractedDate.toLocaleDateString("vi-VN")}`
          );
        } else {
          return {
            response:
              "Tôi không hiểu thời gian bạn vừa nhập. Vui lòng thử lại với format như: '31/12/2025', 'tháng 12 năm 2025', hoặc 'cuối năm'",
            action: "CHAT_RESPONSE",
          };
        }
      }

      // Các trường hợp khác... reset state
      this.resetConversationState(userId);
      return {
        response: "Đã có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại.",
        action: "CHAT_RESPONSE",
      };
    } catch (error) {
      console.error("Follow-up error:", error);
      this.resetConversationState(userId);
      return {
        response: "Đã có lỗi xảy ra. Bạn có thể thử lại không?",
        action: "CHAT_RESPONSE",
      };
    }
  }

  // --- HÀM MỚI: Xây dựng prompt cho Gemini ---
  buildPrompt(userMessage, userContext) {
    const { categories, accounts, recentTransactions, currentDate } =
      userContext;

    // Tạo danh sách categories và accounts dưới dạng string với format chi tiết
    const categoryList =
      categories && categories.length > 0
        ? categories.map((c) => `"${c.name}" (${c.type})`).join(", ")
        : "";
    const accountList =
      accounts && accounts.length > 0
        ? accounts
            .map(
              (a) =>
                `"${a.name}" (${a.type}${a.bankName ? `, ${a.bankName}` : ""})`
            )
            .join(", ")
        : "";

    // Tạo danh sách để AI nhận diện entities
    const accountNames =
      accounts && accounts.length > 0
        ? accounts.map((a) => a.name).join(", ")
        : "";
    const bankNames =
      accounts && accounts.length > 0
        ? accounts
            .filter((a) => a.bankName)
            .map((a) => a.bankName)
            .join(", ")
        : "";
    const categoryNames =
      categories && categories.length > 0
        ? categories.map((c) => c.name).join(", ")
        : "";

    // Xác định trạng thái của người dùng để AI hiểu context
    const isNewUser =
      (!categories || categories.length === 0) &&
      (!accounts || accounts.length === 0);
    const userStatusContext = isNewUser
      ? "\n⚠️ LƯU Ý: Đây là người dùng mới, chưa có tài khoản và danh mục nào. Ưu tiên hướng dẫn tạo tài khoản và danh mục trước khi thực hiện giao dịch."
      : "";

    return `
SYSTEM: Bạn là AI assistant chuyên về tài chính cá nhân. Phân tích yêu cầu người dùng, xác định INTENT và trích xuất ENTITIES (thực thể) cụ thể.${userStatusContext}

### THÔNG TIN NGƯỜI DÙNG HIỆN TẠI
- Ngày hiện tại: ${currentDate}
- Danh mục có sẵn: ${categoryList || "Chưa có danh mục nào"}
- Tài khoản có sẵn: ${accountList || "Chưa có tài khoản nào"}
- Giao dịch gần đây: ${
      recentTransactions && recentTransactions.length > 0
        ? recentTransactions
            .map((t) => `${t.name} (${t.amount.toLocaleString()}đ - ${t.type})`)
            .join(", ")
        : "Chưa có giao dịch nào"
    }

### DANH SÁCH ENTITIES ĐỂ NHẬN DIỆN
- Tên tài khoản: ${accountNames || "Không có"}
- Tên ngân hàng: ${bankNames || "Không có"}  
- Tên danh mục: ${categoryNames || "Không có"}

### YÊU CẦU NGƯỜI DÙNG
"${userMessage}"

### CÁC INTENT CÓ THỂ XỬ LÝ VÀ ENTITIES CẦN TRÍCH XUẤT
1. **ADD_ACCOUNT** - Thêm tài khoản mới (ngân hàng hoặc tiền mặt)
   - Entities: name, type (TIENMAT/THENGANHANG), bankName, accountNumber, initialBalance
   - Patterns: "tạo tài khoản", "thêm tài khoản", "mở tài khoản", "tạo ví"
   - Balance patterns: "với số dư", "balance", "số tiền ban đầu", "nạp"

2. **QUICK_STATS** - Xem thống kê, báo cáo, tổng quan
   - Entities: timeFilter (tháng này, tháng trước, tháng X)

3. **COMPARE_MONTHS** - So sánh chi tiêu giữa các tháng
   - Entities: monthCount (số tháng cần so sánh, mặc định 3)
   - Patterns: "so sánh tháng", "tháng nào chi nhiều", "tháng nào tiết kiệm", "xu hướng chi tiêu", "so sánh 3 tháng", "tháng nào sài nhiều", "tháng nào sài ít"

4. **ANALYZE_FINANCES** - Phân tích sức khỏe tài chính và đưa ra insights
   - Entities: không cần
   - Patterns: "phân tích tài chính", "đánh giá tài chính", "tình hình tài chính", "sức khỏe tài chính", "insights", "nhận xét", "gợi ý chi tiêu", "thói quen chi tiêu", "cảnh báo tài chính"

5. **VIEW_ACCOUNTS** - Xem danh sách tài khoản và số dư
   - Entities: specificAccount (tên tài khoản cụ thể), bankFilter (ngân hàng cụ thể)

4. **VIEW_TRANSACTIONS** - Xem giao dịch
   - Entities: timeFilter, accountFilter, categoryFilter, amountFilter

5. **VIEW_CATEGORIES** - Xem danh sách danh mục
   - Entities: typeFilter (chi tiêu/thu nhập)

6. **VIEW_GOALS** - Xem mục tiêu
   - Entities: statusFilter (đang thực hiện, hoàn thành, quá hạn)

7. **ADD_TRANSACTION** - Thêm giao dịch mới
  - Entities: amount, description, accountGuess, categoryGuess

8. **IMPORT_INVOICE** - Nhập hóa đơn/biên lai và tự động tách thành nhiều khoản thu/chi
  - Entities: merchantName, invoiceDate, totalAmount, invoice.items[]
  - Mỗi item phải là một dòng chi tiết hóa đơn và có thể tự gán categoryGuess phù hợp
  - Nếu user dán nội dung hóa đơn, hãy ưu tiên intent này thay vì ADD_TRANSACTION

9. **ADD_CATEGORY** - Thêm danh mục mới
   - Entities: name, type

10. **ADD_GOAL** - Thêm mục tiêu mới  
   - Entities: name, targetAmount, deadline

11. **QUERY_TRANSACTIONS** - Tìm kiếm giao dịch
   - Entities: searchTerm, timeFilter, amountRange

11. **UNKNOWN** - Không xác định được

### QUY TẮC PHẢN HỒI
- Chỉ trả về JSON thuần túy, không có markdown hay giải thích
- LUÔN trích xuất entities từ câu nói của user
- Sử dụng đúng tên category/account có sẵn của user để match entities
- Với ADD_ACCOUNT: khi user nói "tạo tài khoản", "thêm tài khoản", "mở tài khoản" => PHẢI trả về intent: "ADD_ACCOUNT"
${
  isNewUser
    ? `
### QUY TẮC ĐẶC BIỆT CHO NGƯỜI DÙNG MỚI
- Nếu user yêu cầu thêm giao dịch mà chưa có tài khoản/danh mục => hướng dẫn tạo tài khoản và danh mục trước
- Ưu tiên intent ADD_ACCOUNT hoặc ADD_CATEGORY khi user chưa setup cơ bản
- Đối với transaction: accountGuess và categoryGuess có thể để null nếu chưa có
- responseForUser phải giải thích rõ tại sao cần tạo tài khoản/danh mục trước`
    : ""
}

### FORMAT JSON BẮT BUỘC
{
  "intent": "...",
  "entities": {
    "specificAccount": "tên tài khoản cụ thể hoặc null",
    "bankFilter": "tên ngân hàng cụ thể hoặc null", 
    "categoryFilter": "tên danh mục cụ thể hoặc null",
    "timeFilter": "tháng này|tháng trước|tháng X|hôm nay|tuần này hoặc null",
    "amountFilter": "trên X|dưới X|từ X đến Y hoặc null",
    "searchTerm": "từ khóa tìm kiếm hoặc null",
    "typeFilter": "CHITIEU|THUNHAP hoặc null",
    "statusFilter": "active|completed|overdue hoặc null",
    "monthCount": "số tháng cần so sánh (mặc định 3) hoặc null"
  },
    "statusFilter": "active|completed|overdue hoặc null"
  },
  "transaction": null hoặc { "name": "...", "amount": số, "type": "CHITIEU/THUNHAP", "accountGuess": "...", "categoryGuess": "..." },
  "invoice": null hoặc { "merchantName": "...", "invoiceNumber": "...", "invoiceDate": "YYYY-MM-DD", "totalAmount": số, "autoImport": true, "items": [ { "name": "...", "amount": số, "type": "CHITIEU/THUNHAP", "categoryGuess": "...", "accountGuess": "...", "note": "..." } ] },
  "category": null hoặc { "name": "...", "type": "CHITIEU/THUNHAP" },
  "account": null hoặc { "name": "...", "type": "TIENMAT/THENGANHANG", "bankName": "...", "accountNumber": "...", "initialBalance": số },
  "goal": null hoặc { "name": "...", "targetAmount": số, "deadline": "YYYY-MM-DD" },
  "responseForUser": "Câu trả lời ngắn gọn phản ánh entities được trích xuất"
}
    `;
  }

  // Gọi Gemini API tối ưu với timeout và retry
  async callGeminiOptimized(userMessage, userContext, maxRetries = 3) {
    const prompt = this.buildPrompt(userMessage, userContext);

    console.log("=== CALLING GEMINI WITH PROMPT ===");
    console.log("Prompt length:", prompt.length);
    console.log("Max retries:", maxRetries);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries}`);

        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Gemini API timeout")), 10000)
          ),
        ]);

        console.log(`✅ Gemini API call successful on attempt ${attempt}`);
        return result;
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);

        if (this.isGeminiRateLimitError(error)) {
          console.error(
            "Gemini rate limit reached during callGeminiOptimized. Stopping retries early."
          );
          throw error;
        }

        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Thử xử lý local trước khi gọi Gemini
  async tryLocalProcessing(message, userId) {
    const lowerMessage = message.toLowerCase().trim();

    // Pattern cho compare expenses
    if (
      lowerMessage.includes("so sánh") ||
      (lowerMessage.includes("chi tiêu") && 
       (lowerMessage.includes("tháng") || lowerMessage.includes("so")))
    ) {
      console.log("Local processing: COMPARE_EXPENSES");
      // Extract number of months if specified
      const monthMatch = message.match(/(\d+)\s*tháng/i);
      const monthCount = monthMatch ? parseInt(monthMatch[1]) : 3;
      return await this.utilsHelper.compareMonths(userId, monthCount);
    }

    // Pattern cho quick stats
    if (
      lowerMessage.includes("thống kê") ||
      lowerMessage.includes("báo cáo") ||
      lowerMessage.includes("tổng quan") ||
      lowerMessage.includes("stats")
    ) {
      console.log("Local processing: QUICK_STATS");
      return await this.utilsHelper.getQuickStats(userId);
    }

    // Pattern cho view accounts
    if (
      lowerMessage.includes("xem tài khoản") ||
      lowerMessage.includes("danh sách tài khoản") ||
      lowerMessage.includes("accounts")
    ) {
      console.log("Local processing: VIEW_ACCOUNTS");
      return await this.accountHandler.getAccountListWithFilter(userId, {});
    }

    return null; // Không xử lý được local
  }

  // =============== METHODS FOR ROUTES ===============
  // Các method này được gọi từ routes/ai.js sau khi user confirm

  // Tạo transaction sau khi user confirm
  async createTransaction(req, res) {
    try {
      const { name, amount, type, categoryGuess, accountGuess, date } =
        req.body;
      const userId = req.user.id;

      console.log("=== CREATE TRANSACTION FROM ROUTE ===");
      console.log("Request body:", req.body);
      console.log("User ID:", userId);

      if (!name || !amount || !type) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin giao dịch bắt buộc",
        });
      }

      // Sử dụng transactionHandler để tạo transaction thực tế
      const result = await this.transactionHandler.createTransactionInDB({
        name,
        amount: Number(amount),
        type,
        categoryGuess,
        accountGuess,
        date: date ? new Date(date) : new Date(),
        userId,
      });

      res.json({
        success: true,
        message: "Đã tạo giao dịch thành công",
        data: result,
      });
    } catch (error) {
      console.error("Error creating transaction:", error);

      // Xử lý lỗi đặc biệt khi user chưa có account
      if (
        error.message.includes("chưa có tài khoản") ||
        error.message.includes("Không tìm thấy tài khoản")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
          code: "NO_ACCOUNT_FOUND",
          suggestion: "Vui lòng tạo tài khoản trước khi thêm giao dịch.",
        });
      }

      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi tạo giao dịch",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Tạo category sau khi user confirm
  async createCategory(req, res) {
    try {
      const { name, type, icon } = req.body;
      const userId = req.user.id;

      console.log("=== CREATE CATEGORY FROM ROUTE ===");
      console.log("Request body:", req.body);

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin danh mục bắt buộc",
        });
      }

      // Sử dụng categoryHandler để tạo category thực tế
      const result = await this.categoryHandler.createCategoryInDB({
        name,
        type,
        icon: icon || this.categoryHandler.getCategoryIcon(name, type),
        userId,
      });

      res.json({
        success: true,
        message: "Đã tạo danh mục thành công",
        data: result,
      });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi tạo danh mục",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Tạo account sau khi user confirm
  async createAccount(req, res) {
    try {
      const { name, type, bankName, accountNumber, initialBalance } = req.body;
      const userId = req.user.id;

      console.log("=== CREATE ACCOUNT FROM ROUTE ===");
      console.log("Request body:", req.body);

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Tên tài khoản không được để trống",
        });
      }

      // Sử dụng accountHandler để tạo account thực tế
      const result = await this.accountHandler.createAccountInDB({
        name,
        type: type || "TIENMAT",
        bankName: bankName || null,
        accountNumber: accountNumber || "",
        initialBalance: Number(initialBalance) || 0,
        userId,
      });

      res.json({
        success: true,
        message: "Đã tạo tài khoản thành công",
        data: result,
      });
    } catch (error) {
      console.error("Error creating account:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi tạo tài khoản",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Tạo goal sau khi user confirm
  async createGoal(req, res) {
    try {
      const { name, targetAmount, deadline, icon } = req.body;
      const userId = req.user.id;

      console.log("=== CREATE GOAL FROM ROUTE ===");
      console.log("Request body:", req.body);

      if (!name || !targetAmount) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin mục tiêu bắt buộc",
        });
      }

      // Sử dụng goalHandler để tạo goal thực tế
      const result = await this.goalHandler.createGoalInDB({
        name,
        targetAmount: Number(targetAmount),
        deadline: deadline ? new Date(deadline) : null,
        icon: icon || "🎯", // Sử dụng emoji giống như manual goal creation
        userId,
      });

      res.json({
        success: true,
        message: "Đã tạo mục tiêu thành công",
        data: result,
      });
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi tạo mục tiêu",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = AIController;
