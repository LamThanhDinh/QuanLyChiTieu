const XLSX = require('xlsx');

/**
 * Convert user data to Excel workbook
 * @param {Object} data - Export data object containing user, accounts, categories, transactions, goals
 * @returns {Object} - XLSX workbook object
 */
const createExcelWorkbook = (data) => {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: User Info
  if (data.user) {
    const userSheet = XLSX.utils.json_to_sheet([data.user]);
    XLSX.utils.book_append_sheet(workbook, userSheet, 'User Info');
  }

  // Sheet 2: Accounts
  if (Array.isArray(data.accounts) && data.accounts.length > 0) {
    const accountsData = data.accounts.map(acc => ({
      'ID': acc._id?.toString() || '',
      'Tên Tài Khoản': acc.name || '',
      'Loại': acc.type || '',
      'Số Dư': acc.balance || 0,
      'Icon': acc.icon || '',
      'Ngày Tạo': acc.createdAt ? new Date(acc.createdAt).toLocaleDateString('vi-VN') : '',
    }));
    const accountsSheet = XLSX.utils.json_to_sheet(accountsData);
    XLSX.utils.book_append_sheet(workbook, accountsSheet, 'Accounts');
  }

  // Sheet 3: Categories
  if (Array.isArray(data.categories) && data.categories.length > 0) {
    const categoriesData = data.categories.map(cat => ({
      'ID': cat._id?.toString() || '',
      'Tên': cat.name || '',
      'Loại': cat.type || '',
      'Icon': cat.icon || '',
      'Là Goal Category': cat.isGoalCategory ? 'Có' : 'Không',
      'Goal ID': cat.goalId?.toString() || '',
      'Ngày Tạo': cat.createdAt ? new Date(cat.createdAt).toLocaleDateString('vi-VN') : '',
    }));
    const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Categories');
  }

  // Sheet 4: Transactions
  if (Array.isArray(data.transactions) && data.transactions.length > 0) {
    const transactionsData = data.transactions.map(trans => ({
      'ID': trans._id?.toString() || '',
      'Loại': trans.type || '',
      'Tên': trans.name || '',
      'Số Tiền': trans.amount || 0,
      'Ngày': trans.date ? new Date(trans.date).toLocaleDateString('vi-VN') : '',
      'Tài Khoản': typeof trans.accountId === 'object' ? trans.accountId.name : trans.accountId?.toString() || '',
      'Danh Mục': typeof trans.categoryId === 'object' ? trans.categoryId.name : trans.categoryId?.toString() || '',
      'Ghi Chú': trans.note || '',
      'Ngày Tạo': trans.createdAt ? new Date(trans.createdAt).toLocaleDateString('vi-VN') : '',
    }));
    const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
    XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');
  }

  // Sheet 5: Goals
  if (Array.isArray(data.goals) && data.goals.length > 0) {
    const goalsData = data.goals.map(goal => ({
      'ID': goal._id?.toString() || '',
      'Tên Mục Tiêu': goal.name || '',
      'Mục Tiêu': goal.targetAmount || 0,
      'Đã Có': goal.currentAmount || 0,
      'Hạn Chót': goal.deadline ? new Date(goal.deadline).toLocaleDateString('vi-VN') : '',
      'Icon': goal.icon || '',
      'Trạng Thái': goal.status || 'in-progress',
      'Đã Ghim': goal.isPinned ? 'Có' : 'Không',
      'Đã Lưu Trữ': goal.archived ? 'Có' : 'Không',
      'Ngày Tạo': goal.createdAt ? new Date(goal.createdAt).toLocaleDateString('vi-VN') : '',
    }));
    const goalsSheet = XLSX.utils.json_to_sheet(goalsData);
    XLSX.utils.book_append_sheet(workbook, goalsSheet, 'Goals');
  }

  return workbook;
};

/**
 * Export data to Excel file buffer
 * @param {Object} data - Export data object
 * @returns {Buffer} - Excel file buffer
 */
const exportToExcelBuffer = (data) => {
  const workbook = createExcelWorkbook(data);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Parse Excel file buffer to data object
 * @param {Buffer} buffer - Excel file buffer
 * @returns {Object} - Parsed data object
 */
const parseExcelBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const result = {
    user: [],
    accounts: [],
    categories: [],
    transactions: [],
    goals: [],
  };

  // Parse sheets
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    switch (sheetName) {
      case 'User Info':
        result.user = data.length > 0 ? data[0] : {};
        break;
      case 'Accounts':
        result.accounts = data.map(row => ({
          name: row['Tên Tài Khoản'] || row.name || '',
          type: row['Loại'] || row.type || '',
          balance: parseFloat(row['Số Dư'] || row.balance || 0),
          icon: row['Icon'] || row.icon || 'fa-wallet',
        }));
        break;
      case 'Categories':
        result.categories = data.map(row => ({
          name: row['Tên'] || row.name || '',
          type: row['Loại'] || row.type || '',
          icon: row['Icon'] || row.icon || 'fa-question-circle',
          isGoalCategory: (row['Là Goal Category'] || row.isGoalCategory) === 'Có' || false,
        }));
        break;
      case 'Transactions':
        result.transactions = data.map(row => ({
          type: row['Loại'] || row.type || '',
          name: row['Tên'] || row.name || '',
          amount: parseFloat(row['Số Tiền'] || row.amount || 0),
          date: row['Ngày'] || row.date || new Date(),
          accountId: { name: row['Tài Khoản'] || row.accountId || '' },
          categoryId: { name: row['Danh Mục'] || row.categoryId || '' },
          note: row['Ghi Chú'] || row.note || '',
        }));
        break;
      case 'Goals':
        result.goals = data.map(row => ({
          name: row['Tên Mục Tiêu'] || row.name || '',
          targetAmount: parseFloat(row['Mục Tiêu'] || row.targetAmount || 0),
          currentAmount: parseFloat(row['Đã Có'] || row.currentAmount || 0),
          deadline: row['Hạn Chót'] || row.deadline || new Date(),
          icon: row['Icon'] || row.icon || '🎯',
          status: row['Trạng Thái'] || row.status || 'in-progress',
          isPinned: (row['Đã Ghim'] || row.isPinned) === 'Có' || false,
          archived: (row['Đã Lưu Trữ'] || row.archived) === 'Có' || false,
        }));
        break;
    }
  });

  return result;
};

module.exports = {
  createExcelWorkbook,
  exportToExcelBuffer,
  parseExcelBuffer,
};
