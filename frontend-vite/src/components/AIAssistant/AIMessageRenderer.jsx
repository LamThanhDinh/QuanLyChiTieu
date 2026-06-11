import React from "react";
import styles from "./AIMessageRenderer.module.css";

const AIMessageRenderer = ({ content }) => {
  // Parse HTML-like tags và convert thành React elements
  const parseMessage = (text) => {
    if (!text) return "";

    // Replace HTML-like tags với React styling
    let parsedText = text
      // Strong tags
      .replace(/<strong>(.*?)<\/strong>/g, '<span class="ai-strong">$1</span>')
      .replace(/<em>(.*?)<\/em>/g, '<span class="ai-emphasis">$1</span>')

      // Income/Expense spans với colors
      .replace(
        /<span class="income">(.*?)<\/span>/g,
        '<span class="ai-income">$1</span>'
      )
      .replace(
        /<span class="expense">(.*?)<\/span>/g,
        '<span class="ai-expense">$1</span>'
      )
      .replace(
        /<span class="balance">(.*?)<\/span>/g,
        '<span class="ai-balance">$1</span>'
      )
      .replace(
        /<span class="balance positive">(.*?)<\/span>/g,
        '<span class="ai-positive">$1</span>'
      )
      .replace(
        /<span class="balance negative">(.*?)<\/span>/g,
        '<span class="ai-negative">$1</span>'
      )
      .replace(
        /<span class="remaining positive">(.*?)<\/span>/g,
        '<span class="ai-positive">$1</span>'
      )
      .replace(
        /<span class="remaining negative">(.*?)<\/span>/g,
        '<span class="ai-negative">$1</span>'
      )
      .replace(
        /<span class="progress">(.*?)<\/span>/g,
        '<span class="ai-progress">$1</span>'
      );

    // Split theo newlines và tạo paragraphs
    const lines = parsedText.split("\n").filter((line) => line.trim());

    return lines.map((line, index) => {
      // Check if line has emoji at start (statistics headers)
      const isHeader = /^[📊💰💸🏦📈✅❌🎯]/u.test(line.trim());

      // Check if line is a dash divider (contains only dashes and spaces)
      const isDashLine =
        /^[\s─-]+$/.test(line.trim()) && line.trim().length > 10;

      // Parse individual line for HTML tags
      const parts = [];
      let currentIndex = 0;

      // Regex để tìm các span tags
      const tagRegex = /<span class="([\w-]+)">(.*?)<\/span>/g;
      let match;

      while ((match = tagRegex.exec(line)) !== null) {
        // Add text before the tag
        if (match.index > currentIndex) {
          parts.push(line.substring(currentIndex, match.index));
        }

        // Add the styled span
        const className = match[1];
        const content = match[2];
        parts.push(
          <span
            key={`${index}-${match.index}`}
            className={styles[className.replace("-", "_")]}
          >
            {content}
          </span>
        );

        currentIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (currentIndex < line.length) {
        parts.push(line.substring(currentIndex));
      }

      // Special handling for dash lines
      if (isDashLine) {
        return (
          <div key={index} className={styles.dashLine}>
            ──────────────────────────────────────
          </div>
        );
      }

      return (
        <div
          key={index}
          className={`${styles.messageLine} ${isHeader ? styles.headerLine : ""}`}
        >
          {parts.length > 0 ? parts : line}
        </div>
      );
    });
  };

  return <div className={styles.messageContainer}>{parseMessage(content)}</div>;
};

export default AIMessageRenderer;