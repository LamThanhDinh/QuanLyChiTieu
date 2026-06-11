const jwt = require("jsonwebtoken");
const verifyToken = require("../../middleware/verifyToken");
const {
  createTestUser,
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
} = require("../helpers/testHelpers");

describe("verifyToken middleware", () => {
  let testUser, validToken;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    testUser = await createTestUser();
    validToken = jwt.sign(
      { id: testUser._id, username: testUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it("should authenticate with valid Bearer token", () => {
    const req = {
      headers: {
        authorization: `Bearer ${validToken}`,
      },
    };
    const res = {};
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(testUser._id.toString());
    expect(req.user.username).toBe(testUser.username);
    expect(next).toHaveBeenCalled();
  });

  it("should fail when no authorization header is provided", () => {
    const req = {
      headers: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Không có token. Truy cập bị từ chối.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should fail when authorization header does not contain Bearer token", () => {
    const req = {
      headers: {
        authorization: "InvalidFormat",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Không có token. Truy cập bị từ chối.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should fail with invalid JWT token", () => {
    const req = {
      headers: {
        authorization: "Bearer invalidtoken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token không hợp lệ.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should fail with expired JWT token", () => {
    const expiredToken = jwt.sign(
      { id: testUser._id, username: testUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "-1h" } // Expired 1 hour ago
    );

    const req = {
      headers: {
        authorization: `Bearer ${expiredToken}`,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token không hợp lệ.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should fail with token signed with wrong secret", () => {
    const wrongSecretToken = jwt.sign(
      { id: testUser._id, username: testUser.username },
      "wrongsecret",
      { expiresIn: "1h" }
    );

    const req = {
      headers: {
        authorization: `Bearer ${wrongSecretToken}`,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token không hợp lệ.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle authorization header with only Bearer", () => {
    const req = {
      headers: {
        authorization: "Bearer ",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Không có token. Truy cập bị từ chối.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should fail with multiple spaces in authorization header", () => {
    const req = {
      headers: {
        authorization: `Bearer  ${validToken}`, // Extra space
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    // This will fail because the split(" ")[1] will be an empty string
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Không có token. Truy cập bị từ chối.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should preserve original token payload in req.user", () => {
    const customPayload = {
      id: testUser._id,
      username: testUser.username,
      customField: "customValue",
    };
    const customToken = jwt.sign(customPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const req = {
      headers: {
        authorization: `Bearer ${customToken}`,
      },
    };
    const res = {};
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(testUser._id.toString());
    expect(req.user.username).toBe(testUser.username);
    expect(req.user.customField).toBe("customValue");
    expect(req.user).toHaveProperty("iat"); // JWT issued at
    expect(req.user).toHaveProperty("exp"); // JWT expiration
    expect(next).toHaveBeenCalled();
  });
});
