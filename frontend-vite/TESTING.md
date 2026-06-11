# Testing Guide - ExpenseManagement Frontend

## Giới thiệu

Dự án sử dụng **Vitest** và **React Testing Library** để thực hiện unit testing cho các thành phần React, utility functions, API services và hooks.

## Cấu trúc Test

```
src/
├── test/
│   ├── setup.js              # Cấu hình global cho testing
│   └── test-utils.jsx        # Utilities và helpers cho testing
├── utils/__tests__/
│   ├── timeHelpers.test.js   # Test cho time utilities
│   └── iconMap.test.js       # Test cho icon mapping
├── api/__tests__/
│   ├── authService.test.js   # Test cho authentication API
│   └── transactionsService.test.js  # Test cho transactions API
├── hooks/__tests__/
│   └── useTheme.test.jsx     # Test cho theme hook
├── components/**/__tests__/
│   └── TransactionItem.test.jsx  # Test cho components
└── pages/__tests__/
    └── Welcome.test.jsx      # Test cho page components
```

## Scripts Testing

```bash
# Chạy tất cả tests
npm run test

# Chạy tests với UI
npm run test:ui

# Chạy tests một lần (không watch mode)
npm run test:run

# Chạy tests với coverage report
npm run test:coverage
```

## Các loại Test đã implement

### 1. Utility Functions Tests

- **timeHelpers.test.js**: Test các hàm helper về thời gian
- **iconMap.test.js**: Test các hàm xử lý icons

### 2. API Services Tests

- **authService.test.js**: Test login/register API calls
- **transactionsService.test.js**: Test CRUD operations cho transactions

### 3. Hooks Tests

- **useTheme.test.jsx**: Test theme management hook

### 4. Component Tests

- **TransactionItem.test.jsx**: Test component hiển thị transaction
- **Welcome.test.jsx**: Test welcome page

## Best Practices

### 1. Mocking

- Mock các dependencies bên ngoài (axios, router, etc.)
- Sử dụng vi.fn() cho function mocking
- Mock CSS modules để tránh lỗi import

### 2. Test Structure

- Sử dụng describe/it pattern
- Clear và setup trong beforeEach/afterEach
- Test cả happy path và error cases

### 3. Testing Components

- Test render correctly
- Test user interactions (click, input, etc.)
- Test props handling
- Test error states

### 4. Testing APIs

- Mock axios instances
- Test với different parameters
- Test error handling
- Test response handling

## Test Utilities

### renderWithProviders

```jsx
import { renderWithProviders } from "../test/test-utils";

// Render component với all providers (Router, Theme, QueryClient)
const { queryClient } = renderWithProviders(<MyComponent />);
```

### Mock Data Factories

```jsx
import { createMockTransaction, createMockUser } from "../test/test-utils";

const mockTransaction = createMockTransaction({
  amount: 100000,
  description: "Custom description",
});
```

## Cấu hình

### Vitest Config (vite.config.js)

```javascript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.js'],
  css: true,
}
```

### Setup File (src/test/setup.js)

- Import @testing-library/jest-dom
- Mock global objects (localStorage, fetch, etc.)
- Mock browser APIs (IntersectionObserver, etc.)

## Coverage

Để xem coverage report:

```bash
npm run test:coverage
```

Coverage targets:

- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

## Debugging Tests

### 1. Debug trong VS Code

- Set breakpoints trong test files
- Run tests in debug mode

### 2. Console debugging

```javascript
import { screen } from "@testing-library/react";

// Debug DOM tree
screen.debug();

// Debug specific element
screen.debug(screen.getByTestId("my-element"));
```

### 3. Test UI

```bash
npm run test:ui
```

Mở browser interface để xem và debug tests.

## Common Patterns

### 1. Testing User Interactions

```javascript
import { fireEvent } from "@testing-library/react";

const button = screen.getByRole("button");
fireEvent.click(button);
expect(mockFunction).toHaveBeenCalled();
```

### 2. Testing Async Operations

```javascript
import { waitFor } from "@testing-library/react";

await waitFor(() => {
  expect(screen.getByText("Loading...")).toBeInTheDocument();
});
```

### 3. Testing Forms

```javascript
const input = screen.getByLabelText("Email");
fireEvent.change(input, { target: { value: "test@example.com" } });
expect(input.value).toBe("test@example.com");
```

## Extending Tests

### Thêm test mới:

1. Tạo file test trong thư mục `__tests__` tương ứng
2. Import component/function cần test
3. Setup mocks nếu cần
4. Viết test cases
5. Run tests để verify

### Test Integration:

- Test user flows end-to-end
- Test component interactions
- Test với real API calls (optional)

## Troubleshooting

### Common Issues:

1. **CSS Module errors**: Đảm bảo mock CSS modules
2. **Router errors**: Wrap components trong BrowserRouter
3. **Context errors**: Sử dụng renderWithProviders
4. **Async errors**: Sử dụng waitFor cho async operations

### Performance:

- Tránh tạo quá nhiều DOM nodes
- Clear mocks trong beforeEach
- Sử dụng fake timers khi cần thiết
