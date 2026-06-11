import React, { createContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Kiểm tra localStorage trước
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Mặc định luôn là light mode, không dựa vào system preference
    // Điều này đảm bảo giao diện luôn khởi tạo ở light mode
    return false;
  });

  // Set theme class ngay khi component mount để tránh FOUC
  React.useLayoutEffect(() => {
    const applyTheme = (isDark) => {
      if (isDark) {
        document.documentElement.classList.add("dark-theme", "dark");
        document.documentElement.classList.remove("light-theme");
      } else {
        document.documentElement.classList.add("light-theme");
        document.documentElement.classList.remove("dark-theme", "dark");
      }
    };

    // Apply theme ngay lập tức
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    // Lưu vào localStorage
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? "dark" : "light",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
