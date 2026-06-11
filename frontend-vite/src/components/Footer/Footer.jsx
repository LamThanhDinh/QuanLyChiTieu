// src/components/Footer/FooterSocial.jsx
import React from "react";
import { Link } from "react-router-dom"; // Sử dụng nếu bạn có các trang này trong app
import styles from "./Footer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// Import các icon bạn muốn sử dụng, ví dụ:
import {
  faFacebookF,
  faGithub,
  faLinkedinIn,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { faHeart } from "@fortawesome/free-solid-svg-icons"; // Ví dụ icon trái tim

const FooterSocial = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.mainInfo}>
          <p className={styles.copyright}>
            &copy; {currentYear} KÉT SẮT SỐ App. All rights reserved.
          </p>
          <p className={styles.madeWith}>
            Made with{" "}
            <FontAwesomeIcon icon={faHeart} className={styles.heartIcon} /> by
            Lâm Thanh Đỉnh
          </p>
        </div>

        <nav className={styles.footerLinks}>
          {/* Ví dụ các link, bạn có thể thay đổi hoặc bỏ bớt */}
          <Link to="/about" className={styles.linkItem}>
            Về chúng tôi
          </Link>
          <Link to="/faq" className={styles.linkItem}>
            FAQ
          </Link>
          <Link to="/terms-of-service" className={styles.linkItem}>
            Điều khoản
          </Link>
          <Link to="/privacy-policy" className={styles.linkItem}>
            Bảo mật
          </Link>
          <Link to="/contact" className={styles.linkItem}>
            Liên hệ
          </Link>
        </nav>

        <div className={styles.socialIcons}>
          {/* Thay thế bằng link mạng xã hội thực tế của bạn */}
          <a
            href="https://www.facebook.com/nottdd/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className={styles.socialIconLink}
          >
            <FontAwesomeIcon icon={faFacebookF} />
          </a>
          <a
            href="https://github.com/LamThanhDinh"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className={styles.socialIconLink}
          >
            <FontAwesomeIcon icon={faGithub} />
          </a>
          <a
            href="https://linkedin.com/in/yourprofile"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className={styles.socialIconLink}
          >
            <FontAwesomeIcon icon={faLinkedinIn} />
          </a>
          <a
            href="https://www.instagram.com/nevasaygbye/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className={styles.socialIconLink}
          >
            <FontAwesomeIcon icon={faInstagram} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterSocial;
