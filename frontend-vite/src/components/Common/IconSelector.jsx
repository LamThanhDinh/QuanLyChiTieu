import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSearch } from "@fortawesome/free-solid-svg-icons";
import { availableIconsForSelection, getIconObject } from "../../utils/iconMap";
import styles from "./IconSelector.module.css";

const IconSelector = ({ selectedIcon, onIconSelect, onClose, isOpen }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc icons dựa trên từ khóa tìm kiếm
  const filteredIcons = availableIconsForSelection.filter((icon) =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Chọn Icon</h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            type="button"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm icon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.iconGrid}>
          {filteredIcons.map((icon) => (
            <button
              key={icon.identifier}
              type="button"
              className={`${styles.iconButton} ${
                selectedIcon === icon.identifier ? styles.selected : ""
              }`}
              onClick={() => {
                onIconSelect(icon.identifier);
                onClose();
              }}
              title={icon.name}
            >
              <FontAwesomeIcon
                icon={getIconObject(icon.identifier)}
                className={styles.icon}
              />
              <span className={styles.iconName}>{icon.name}</span>
            </button>
          ))}
        </div>

        {filteredIcons.length === 0 && (
          <div className={styles.noResults}>
            <p>Không tìm thấy icon phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IconSelector;
