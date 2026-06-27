const mongoose = require("mongoose");
const Family = require("../models/Family");
const FamilyInvitation = require("../models/FamilyInvitation");
const Notification = require("../models/Notification");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Account = require("../models/Account");
const Category = require("../models/Category");

const toObjectId = (id) =>
  typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;

const getIdValue = (value) => value?._id || value;

const isSameId = (a, b) => String(getIdValue(a) || "") === String(getIdValue(b) || "");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const getMember = (family, userId) =>
  family.members.find((member) => isSameId(member.userId, userId));

const isOwner = (family, userId) => isSameId(family.ownerId, userId);

const loadFamilyForMember = async (familyId, userId) => {
  const family = await Family.findById(familyId)
    .populate("ownerId", "fullname email username avatar")
    .populate("members.userId", "fullname email username avatar");

  if (!family || !getMember(family, userId)) return null;
  return family;
};

const createNotification = (payload) => Notification.create(payload);

const formatTransaction = (transaction) => ({
  id: transaction._id,
  _id: transaction._id,
  name: transaction.name,
  description: transaction.name,
  amount: transaction.amount,
  type: transaction.type,
  note: transaction.note,
  date: transaction.date,
  createdAt: transaction.createdAt,
  familyId: transaction.familyId,
  createdBy: transaction.userId,
  category: transaction.categoryId,
  paymentMethod: transaction.accountId,
});

const getFamilyStats = async (familyId) => {
  const totals = await Transaction.aggregate([
    { $match: { familyId: toObjectId(familyId) } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  return totals.reduce(
    (acc, item) => {
      if (item._id === "THUNHAP") {
        acc.totalIncome = item.total || 0;
        acc.incomeCount = item.count || 0;
      }
      if (item._id === "CHITIEU") {
        acc.totalExpense = item.total || 0;
        acc.expenseCount = item.count || 0;
      }
      acc.totalTransactions += item.count || 0;
      acc.balance = acc.totalIncome - acc.totalExpense;
      return acc;
    },
    {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      incomeCount: 0,
      expenseCount: 0,
      totalTransactions: 0,
    }
  );
};

exports.createFamily = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description = "" } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Tên gia đình là bắt buộc" });
    }

    const user = await User.findById(userId).select("email fullname username");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const family = await Family.create({
      name: String(name).trim(),
      description: String(description || "").trim(),
      ownerId: userId,
      members: [
        {
          userId,
          email: normalizeEmail(user.email),
          role: "owner",
          status: "active",
          joinedAt: new Date(),
        },
      ],
    });

    res.status(201).json(family);
  } catch (error) {
    console.error("Error creating family:", error);
    res.status(500).json({ message: "Lỗi khi tạo gia đình", error: error.message });
  }
};

exports.getFamilies = async (req, res) => {
  try {
    const families = await Family.find({ "members.userId": req.user.id })
      .populate("ownerId", "fullname email username avatar")
      .populate("members.userId", "fullname email username avatar")
      .sort({ updatedAt: -1 });

    res.json({ data: families });
  } catch (error) {
    console.error("Error getting families:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách gia đình" });
  }
};

exports.getFamilyCategoryStats = async (req, res) => {
  try {
    const family = await loadFamilyForMember(req.params.id, req.user.id);
    if (!family) {
      return res.status(403).json({ message: "Bạn không có quyền xem thống kê gia đình này" });
    }

    const { period, year, month, date: dateParam } = req.query;

    // Xây dựng bộ lọc thời gian
    const matchTimeFilter = {};
    if (period) {
      let startDate, endDate;
      switch (period) {
        case "year":
          if (year) {
            const y = parseInt(year);
            startDate = new Date(Date.UTC(y, 0, 1));
            endDate = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
          }
          break;
        case "month":
          if (year && month) {
            const y = parseInt(year);
            const m = parseInt(month);
            startDate = new Date(Date.UTC(y, m - 1, 1));
            endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
          }
          break;
        case "week":
          if (dateParam) {
            const ref = new Date(dateParam);
            ref.setUTCHours(0, 0, 0, 0);
            const dow = ref.getUTCDay();
            startDate = new Date(ref);
            startDate.setUTCDate(ref.getUTCDate() - dow);
            endDate = new Date(startDate);
            endDate.setUTCDate(startDate.getUTCDate() + 6);
            endDate.setUTCHours(23, 59, 59, 999);
          }
          break;
      }
      if (startDate && endDate) {
        matchTimeFilter.date = { $gte: startDate, $lte: endDate };
      }
    }

    // Aggregate giao dịch gia đình theo categoryId
    const totals = await Transaction.aggregate([
      {
        $match: {
          familyId: toObjectId(family._id),
          ...matchTimeFilter,
        },
      },
      {
        $group: {
          _id: "$categoryId",
          totalAmount: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
          type: { $first: "$type" },
        },
      },
    ]);

    if (totals.length === 0) {
      return res.json([]);
    }

    // Lấy thông tin danh mục
    const categoryIds = totals.map((t) => t._id).filter(Boolean);
    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
    const catMap = {};
    categories.forEach((c) => {
      catMap[c._id.toString()] = c;
    });

    const result = totals
      .filter((t) => t._id)
      .map((t) => {
        const cat = catMap[t._id.toString()] || {};
        return {
          _id: t._id,
          id: t._id,
          name: cat.name || "Không rõ",
          icon: cat.icon || "fa-question-circle",
          type: cat.type || t.type,
          totalAmount: t.totalAmount,
          transactionCount: t.transactionCount,
        };
      });

    res.json(result);
  } catch (error) {
    console.error("Error getting family category stats:", error);
    res.status(500).json({ message: "Lỗi khi lấy thống kê danh mục gia đình" });
  }
};

exports.getFamilyDetail = async (req, res) => {
  try {
    const family = await loadFamilyForMember(req.params.id, req.user.id);
    if (!family) {
      return res.status(404).json({ message: "Không tìm thấy gia đình hoặc bạn không có quyền truy cập" });
    }

    const stats = await getFamilyStats(family._id);
    res.json({ family, stats });
  } catch (error) {
    console.error("Error getting family detail:", error);
    res.status(500).json({ message: "Lỗi khi lấy chi tiết gia đình" });
  }
};

exports.inviteMember = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id);
    if (!family || !isOwner(family, req.user.id)) {
      return res.status(403).json({ message: "Chỉ chủ gia đình mới có quyền mời thành viên" });
    }

    const inviteeEmail = normalizeEmail(req.body.email);
    if (!inviteeEmail) {
      return res.status(400).json({ message: "Email là bắt buộc" });
    }

    const invitee = await User.findOne({ email: inviteeEmail }).select("email fullname username");
    if (!invitee) {
      return res.status(404).json({ message: "Email này chưa đăng ký tài khoản" });
    }

    if (isSameId(invitee._id, req.user.id)) {
      return res.status(400).json({ message: "Bạn đã là chủ gia đình này" });
    }

    if (getMember(family, invitee._id)) {
      return res.status(400).json({ message: "Người dùng này đã là thành viên" });
    }

    const pendingInvitation = await FamilyInvitation.findOne({
      familyId: family._id,
      inviteeId: invitee._id,
      status: "pending",
    });

    if (pendingInvitation) {
      return res.status(400).json({ message: "Đã có lời mời đang chờ phản hồi" });
    }

    const inviter = await User.findById(req.user.id).select("fullname username email");
    const invitation = await FamilyInvitation.create({
      familyId: family._id,
      inviterId: req.user.id,
      inviteeId: invitee._id,
      inviteeEmail,
    });

    await createNotification({
      userId: invitee._id,
      type: "family_invitation",
      title: "Lời mời tham gia gia đình",
      message: `${inviter?.fullname || inviter?.username || "Một người dùng"} đã mời bạn tham gia nhóm chi tiêu gia đình: ${family.name}.`,
      priority: "high",
      familyId: family._id,
      invitationId: invitation._id,
    });

    res.status(201).json({ message: "Đã gửi lời mời", invitation });
  } catch (error) {
    console.error("Error inviting member:", error);
    res.status(500).json({ message: "Lỗi khi mời thành viên", error: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id);
    if (!family || !isOwner(family, req.user.id)) {
      return res.status(403).json({ message: "Chỉ chủ gia đình mới có quyền xóa thành viên" });
    }

    const memberUserId = req.params.memberId;
    if (isSameId(memberUserId, req.user.id) || isSameId(memberUserId, family.ownerId)) {
      return res.status(400).json({ message: "Không thể xóa chủ nhóm khỏi gia đình" });
    }

    const member = getMember(family, memberUserId);
    if (!member) {
      return res.status(404).json({ message: "Không tìm thấy thành viên trong gia đình" });
    }

    family.members = family.members.filter(
      (item) => !isSameId(item.userId, memberUserId)
    );
    await family.save();

    await createNotification({
      userId: memberUserId,
      type: "family_member_removed",
      title: "Bạn đã được xóa khỏi nhóm gia đình",
      message: `Bạn đã được xóa khỏi nhóm chi tiêu gia đình: ${family.name}.`,
      priority: "medium",
      familyId: family._id,
    });

    res.json({ message: "Đã xóa thành viên khỏi gia đình" });
  } catch (error) {
    console.error("Error removing family member:", error);
    res.status(500).json({ message: "Lỗi khi xóa thành viên", error: error.message });
  }
};

exports.updateMemberNickname = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id)
      .populate("ownerId", "fullname email username avatar")
      .populate("members.userId", "fullname email username avatar");

    if (!family || !getMember(family, req.user.id)) {
      return res.status(404).json({ message: "Không tìm thấy gia đình hoặc bạn không có quyền truy cập" });
    }

    const member = getMember(family, req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: "Không tìm thấy thành viên trong gia đình" });
    }

    const memberUserId = member.userId?._id || member.userId;
    const canEditNickname = isOwner(family, req.user.id) || isSameId(memberUserId, req.user.id);
    if (!canEditNickname) {
      return res.status(403).json({
        message: "Bạn chỉ có thể đặt biệt danh của bản thân hoặc thành viên nếu là chủ nhóm",
      });
    }

    member.nickname = String(req.body.nickname || "").trim().slice(0, 40);
    await family.save();

    res.json({ message: "Đã cập nhật biệt danh", family });
  } catch (error) {
    console.error("Error updating member nickname:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật biệt danh", error: error.message });
  }
};

const respondInvitation = async (req, res, status) => {
  const invitation = await FamilyInvitation.findOne({
    _id: req.params.id,
    inviteeId: req.user.id,
    status: "pending",
  }).populate("familyId").populate("inviteeId", "fullname username email");

  if (!invitation) {
    return res.status(404).json({ message: "Không tìm thấy lời mời đang chờ" });
  }

  const family = invitation.familyId;
  invitation.status = status;
  invitation.respondedAt = new Date();
  await invitation.save();

  if (status === "accepted" && !getMember(family, req.user.id)) {
    family.members.push({
      userId: req.user.id,
      email: normalizeEmail(invitation.inviteeEmail),
      role: "member",
      status: "active",
      joinedAt: new Date(),
    });
    await family.save();
  }

  const inviteeName =
    invitation.inviteeId?.fullname ||
    invitation.inviteeId?.username ||
    invitation.inviteeEmail;

  await createNotification({
    userId: invitation.inviterId,
    type: status === "accepted" ? "family_invitation_accepted" : "family_invitation_rejected",
    title: status === "accepted" ? "Lời mời đã được chấp nhận" : "Lời mời đã bị từ chối",
    message:
      status === "accepted"
        ? `${inviteeName} đã chấp nhận tham gia gia đình ${family.name}.`
        : `${inviteeName} đã từ chối lời mời tham gia gia đình ${family.name}.`,
    priority: "medium",
    familyId: family._id,
    invitationId: invitation._id,
  });

  await Notification.updateMany(
    { invitationId: invitation._id, userId: req.user.id },
    { read: true }
  );

  return res.json({
    message: status === "accepted" ? "Đã chấp nhận lời mời" : "Đã từ chối lời mời",
    invitation,
  });
};

exports.acceptInvitation = async (req, res) => {
  try {
    return await respondInvitation(req, res, "accepted");
  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(500).json({ message: "Lỗi khi chấp nhận lời mời" });
  }
};

exports.rejectInvitation = async (req, res) => {
  try {
    return await respondInvitation(req, res, "rejected");
  } catch (error) {
    console.error("Error rejecting invitation:", error);
    res.status(500).json({ message: "Lỗi khi từ chối lời mời" });
  }
};

exports.getFamilyTransactions = async (req, res) => {
  try {
    const family = await loadFamilyForMember(req.params.id, req.user.id);
    if (!family) {
      return res.status(403).json({ message: "Bạn không có quyền xem giao dịch gia đình này" });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find({ familyId: family._id })
        .populate("accountId", "name type bankName")
        .populate("categoryId", "name icon type")
        .populate("userId", "fullname username email avatar")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments({ familyId: family._id }),
    ]);

    const stats = await getFamilyStats(family._id);
    res.json({
      data: transactions.map(formatTransaction),
      stats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting family transactions:", error);
    res.status(500).json({ message: "Lỗi khi lấy giao dịch gia đình" });
  }
};

exports.createFamilyTransaction = async (req, res) => {
  try {
    const family = await loadFamilyForMember(req.params.id, req.user.id);
    if (!family) {
      return res.status(403).json({ message: "Bạn không có quyền thêm giao dịch gia đình này" });
    }

    const { name, amount, type, categoryId, accountId, date, note } = req.body;

    if (!name || amount === undefined || !type || !categoryId || !accountId) {
      return res.status(400).json({ message: "Thiếu thông tin giao dịch" });
    }

    // Validate ObjectId format to avoid CastError
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "categoryId không hợp lệ" });
    }
    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({ message: "accountId không hợp lệ" });
    }

    const numericAmount = Math.round(Number(amount));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Số tiền phải lớn hơn 0" });
    }

    const [account, category] = await Promise.all([
      Account.findOne({ _id: accountId, userId: req.user.id }),
      Category.findOne({ _id: categoryId, userId: req.user.id }),
    ]);

    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản của bạn" });
    }
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục phù hợp" });
    }
    if (category.type !== type) {
      return res.status(400).json({ message: `Danh mục không phù hợp với loại giao dịch (${type})` });
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      familyId: family._id,
      name,
      amount: numericAmount,
      type,
      categoryId: category._id,
      accountId: account._id,
      date: date ? new Date(date) : new Date(),
      note: note || "",
    });

    const populated = await Transaction.findById(transaction._id)
      .populate("accountId", "name type bankName")
      .populate("categoryId", "name icon type")
      .populate("userId", "fullname username email avatar");

    res.status(201).json(formatTransaction(populated));
  } catch (error) {
    console.error("Error creating family transaction:", error.message, error.stack);
    res.status(500).json({ message: "Lỗi khi thêm giao dịch gia đình", detail: error.message });
  }
};

exports.updateFamilyTransaction = async (req, res) => {
  try {
    const family = await loadFamilyForMember(req.params.id, req.user.id);
    if (!family) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập gia đình này" });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.transactionId,
      familyId: family._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch gia đình" });
    }

    if (!isOwner(family, req.user.id) && !isSameId(transaction.userId, req.user.id)) {
      return res.status(403).json({ message: "Bạn chỉ được sửa giao dịch do mình tạo" });
    }

    ["name", "type", "categoryId", "accountId", "date", "note"].forEach((field) => {
      if (req.body[field] !== undefined) transaction[field] = req.body[field];
    });
    if (req.body.amount !== undefined) {
      const numericAmount = Math.round(Number(req.body.amount));
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ message: "Số tiền phải lớn hơn 0" });
      }
      transaction.amount = numericAmount;
    }

    await transaction.save();
    const populated = await Transaction.findById(transaction._id)
      .populate("accountId", "name type bankName")
      .populate("categoryId", "name icon type")
      .populate("userId", "fullname username email avatar");

    res.json(formatTransaction(populated));
  } catch (error) {
    console.error("Error updating family transaction:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật giao dịch gia đình" });
  }
};

exports.deleteFamilyTransaction = async (req, res) => {
  try {
    const family = await loadFamilyForMember(req.params.id, req.user.id);
    if (!family) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập gia đình này" });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.transactionId,
      familyId: family._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch gia đình" });
    }

    if (!isOwner(family, req.user.id) && !isSameId(transaction.userId, req.user.id)) {
      return res.status(403).json({ message: "Bạn chỉ được xóa giao dịch do mình tạo" });
    }

    await transaction.deleteOne();
    res.json({ message: "Đã xóa giao dịch gia đình" });
  } catch (error) {
    console.error("Error deleting family transaction:", error);
    res.status(500).json({ message: "Lỗi khi xóa giao dịch gia đình" });
  }
};

exports.deleteFamily = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id);
    if (!family) {
      return res.status(404).json({ message: "Không tìm thấy gia đình" });
    }
    if (!isOwner(family, req.user.id)) {
      return res.status(403).json({ message: "Chỉ chủ nhóm mới có thể xóa gia đình" });
    }

    // Xóa toàn bộ giao dịch thuộc nhóm
    await Transaction.deleteMany({ familyId: family._id });

    // Thông báo cho các thành viên khác
    const otherMemberIds = family.members
      .filter((m) => !isSameId(m.userId, req.user.id))
      .map((m) => getIdValue(m.userId));

    if (otherMemberIds.length > 0) {
      await Notification.insertMany(
        otherMemberIds.map((uid) => ({
          userId: uid,
          type: "family_deleted",
          title: "Nhóm gia đình đã bị xóa",
          message: `Nhóm chi tiêu gia đình "${family.name}" đã bị chủ nhóm xóa.`,
          priority: "high",
        }))
      );
    }

    await family.deleteOne();
    res.json({ message: "Đã xóa nhóm gia đình" });
  } catch (error) {
    console.error("Error deleting family:", error);
    res.status(500).json({ message: "Lỗi khi xóa nhóm gia đình", error: error.message });
  }
};

exports.leaveFamily = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id);
    if (!family) {
      return res.status(404).json({ message: "Không tìm thấy gia đình" });
    }

    if (isOwner(family, req.user.id)) {
      return res.status(400).json({
        message: "Chủ nhóm không thể rời nhóm. Hãy chuyển quyền chủ nhóm trước hoặc xóa nhóm.",
      });
    }

    const member = getMember(family, req.user.id);
    if (!member) {
      return res.status(404).json({ message: "Bạn không phải thành viên của nhóm này" });
    }

    family.members = family.members.filter((m) => !isSameId(m.userId, req.user.id));
    await family.save();

    // Thông báo cho chủ nhóm
    const leavingUser = await User.findById(req.user.id).select("fullname username email");
    const leaverName = leavingUser?.fullname || leavingUser?.username || leavingUser?.email || "Một thành viên";

    await createNotification({
      userId: family.ownerId,
      type: "family_member_left",
      title: "Thành viên rời nhóm",
      message: `${leaverName} đã rời khỏi nhóm chi tiêu gia đình: ${family.name}.`,
      priority: "medium",
      familyId: family._id,
    });

    res.json({ message: "Đã rời khỏi nhóm gia đình" });
  } catch (error) {
    console.error("Error leaving family:", error);
    res.status(500).json({ message: "Lỗi khi rời nhóm gia đình", error: error.message });
  }
};

exports.transferOwnership = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id);
    if (!family) {
      return res.status(404).json({ message: "Không tìm thấy gia đình" });
    }
    if (!isOwner(family, req.user.id)) {
      return res.status(403).json({ message: "Chỉ chủ nhóm mới có thể chuyển quyền" });
    }

    const { newOwnerId } = req.body;
    if (!newOwnerId) {
      return res.status(400).json({ message: "newOwnerId là bắt buộc" });
    }
    if (isSameId(newOwnerId, req.user.id)) {
      return res.status(400).json({ message: "Bạn đã là chủ nhóm" });
    }

    const newOwnerMember = getMember(family, newOwnerId);
    if (!newOwnerMember) {
      return res.status(404).json({ message: "Người dùng này không phải thành viên nhóm" });
    }

    // Cập nhật role
    family.members = family.members.map((m) => {
      if (isSameId(m.userId, req.user.id)) return { ...m.toObject(), role: "member" };
      if (isSameId(m.userId, newOwnerId)) return { ...m.toObject(), role: "owner" };
      return m;
    });
    family.ownerId = toObjectId(newOwnerId);
    await family.save();

    // Thông báo cho thành viên mới được chuyển quyền
    const currentOwner = await User.findById(req.user.id).select("fullname username email");
    const ownerName = currentOwner?.fullname || currentOwner?.username || "Chủ nhóm cũ";

    await createNotification({
      userId: toObjectId(newOwnerId),
      type: "family_ownership_transferred",
      title: "Bạn là chủ nhóm mới",
      message: `${ownerName} đã chuyển quyền chủ nhóm "${family.name}" cho bạn.`,
      priority: "high",
      familyId: family._id,
    });

    res.json({ message: "Đã chuyển quyền chủ nhóm thành công" });
  } catch (error) {
    console.error("Error transferring ownership:", error);
    res.status(500).json({ message: "Lỗi khi chuyển quyền chủ nhóm", error: error.message });
  }
};
