// src/utils/timeHelpers.js

/**
 * Trả về một câu chào ngẫu nhiên phù hợp với thời gian trong ngày.
 * @returns {string} Một câu chào.
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  const greetings = {
    early_morning: ["Chào buổi sáng sớm!", "Một ngày mới bắt đầu!"], // 4-6h
    morning: ["Chào buổi sáng!", "Chúc bạn một ngày tốt lành!"], // 6-11h
    noon: ["Chào buổi trưa!", "Nghỉ ngơi và nạp năng lượng nhé!"], // 11-13h
    afternoon: ["Chào buổi chiều!", "Buổi chiều năng suất nhé!"], // 13-18h
    evening: ["Chào buổi tối!", "Một buổi tối thư giãn nhé!"], // 18-22h
    night: ["Khuya rồi, nghỉ ngơi thôi!", "Chúc bạn ngủ ngon!"], // 22-4h
  };

  let timeOfDay;
  if (hour >= 4 && hour < 6) timeOfDay = "early_morning";
  else if (hour >= 6 && hour < 11) timeOfDay = "morning";
  else if (hour >= 11 && hour < 13) timeOfDay = "noon";
  else if (hour >= 13 && hour < 18) timeOfDay = "afternoon";
  else if (hour >= 18 && hour < 22) timeOfDay = "evening";
  else timeOfDay = "night";

  const options = greetings[timeOfDay];
  return options[Math.floor(Math.random() * options.length)];
};

/**
 * Trả về ngày hiện tại dưới dạng chuỗi định dạng đầy đủ (Thứ, ngày tháng năm).
 * @returns {string} Ngày đã được định dạng.
 */
export const getFullDate = () => {
  return new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
