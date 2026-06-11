const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "🏦 Expense Management API",
      version: "2.0.0",
      description: [
        "API tài liệu cho hệ thống quản lý chi tiêu cá nhân.",
        "",
        "",
        "Tính năng nổi bật:",
        "- Xác thực người dùng (JWT) và phân quyền",
        "- Quản lý tài khoản ngân hàng, danh mục thu chi, giao dịch, mục tiêu tiết kiệm",
        "- Thống kê báo cáo chi tiết, AI Assistant hỗ trợ tài chính",
        "",
        "Hướng dẫn sử dụng:",
        "1. Đăng ký hoặc đăng nhập tài khoản",
        "2. Thêm Bearer token vào header Authorization",
        "3. Sử dụng các endpoint để quản lý dữ liệu cá nhân",
      ].join("\n"),
      contact: {
        name: "Lâm Thanh Đỉnh",
        email: "thanhdinhtv2004@gmail.com",
        url: "https://github.com/LamThanhDinh",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "🖥️ Development Server",
      },
      {
        url: "https://expense-management-backend-production.onrender.com",
        description: "🌐 Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Nhập JWT token sau khi đăng nhập thành công",
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Token không hợp lệ",
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Không tìm thấy tài nguyên",
                  },
                },
              },
            },
          },
        },
        ValidationError: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Dữ liệu không hợp lệ",
                  },
                  errors: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
        ServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Lỗi server nội bộ",
                  },
                  error: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "🔐 Xác thực và phân quyền",
      },
      {
        name: "Users",
        description: "👤 Quản lý thông tin người dùng",
      },
      {
        name: "Categories",
        description: "📂 Quản lý danh mục thu/chi",
      },
      {
        name: "Accounts",
        description: "🏦 Quản lý tài khoản ngân hàng",
      },
      {
        name: "Transactions",
        description: "💸 Quản lý giao dịch thu/chi",
      },
      {
        name: "Goals",
        description: "🎯 Quản lý mục tiêu tiết kiệm",
      },
      {
        name: "Statistics",
        description: "📊 Thống kê và báo cáo",
      },
      {
        name: "AI Assistant",
        description: "🤖 Trợ lý AI thông minh",
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js"], // Quét các route và controller để lấy mô tả
};

const swaggerSpec = swaggerJSDoc(options);

// Customize Swagger UI options
const swaggerUIOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info hgroup.main a { color: #3b82f6; }
    .swagger-ui .scheme-container { 
      background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
      padding: 10px;
      border-radius: 8px;
    }
    .swagger-ui .info .title {
      color: #1f2937;
      font-size: 2.5rem;
      font-weight: bold;
    }
  `,
  customSiteTitle: "Expense Management API Docs",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: "none",
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
  },
};

module.exports = {
  swaggerUi,
  swaggerSpec,
  swaggerUIOptions,
};
