import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/ForgotPassword.module.css";
import logo from "../assets/login/logo.png";
import bg from "../assets/login/background.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { resetPassword } from "../api/authService";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const [formData, setFormData] = useState({
    email: emailFromState,
    resetToken: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Validate password match
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp!");
      setIsSuccess(false);
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự!");
      setIsSuccess(false);
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword({
        email: formData.email,
        resetToken: formData.resetToken,
        newPassword: formData.newPassword,
      });

      setIsSuccess(true);
      setMessage("Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...");

      // Chuyển về trang login sau 2 giây
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error.response?.data?.message ||
          "Không thể đặt lại mật khẩu. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={styles["forgot-container"]}
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className={styles["forgot-left"]}>
        <img src={logo} alt="logo" className={styles["forgot-logo"]} />
        <h1 className={styles["forgot-title"]}>ĐẶT LẠI MẬT KHẨU</h1>
        <p className={styles["forgot-desc"]}>
          Nhập mã xác thực và mật khẩu mới của bạn
        </p>
      </div>

      <form className={styles["forgot-form-box"]} onSubmit={handleSubmit}>
        {/* Yeti SVG */}
        <div className={styles["svgContainer"]}>
          <svg
            className={`${styles["mySVG"]} ${
              isLoading
                ? styles["loading"]
                : isSuccess
                  ? styles["happy"]
                  : message && !isSuccess
                    ? styles["sad"]
                    : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 200 200"
          >
            <defs>
              <circle id="armMaskPath" cx="100" cy="100" r="100" />
            </defs>
            <clipPath id="armMask">
              <use xlinkHref="#armMaskPath" overflow="visible" />
            </clipPath>
            <circle cx="100" cy="100" r="100" fill="#a9ddf3" />
            <g className={styles["body"]}>
              <path
                className={styles["bodyBGnormal"]}
                stroke="#3A5E77"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="#FFFFFF"
                d="M200,158.5c0-20.2-14.8-36.5-35-36.5h-14.9V72.8c0-27.4-21.7-50.4-49.1-50.8c-28-0.5-50.9,22.1-50.9,50v50 H35.8C16,122,0,138,0,157.8L0,213h200L200,158.5z"
              />
              <path
                fill="#DDF1FA"
                d="M100,156.4c-22.9,0-43,11.1-54.1,27.7c15.6,10,34.2,15.9,54.1,15.9s38.5-5.8,54.1-15.9 C143,167.5,122.9,156.4,100,156.4z"
              />
            </g>
            <g className={styles["earL"]}>
              <g
                className={styles["outerEar"]}
                fill="#ddf1fa"
                stroke="#3a5e77"
                strokeWidth="2.5"
              >
                <circle cx="47" cy="83" r="11.5" />
                <path
                  d="M46.3 78.9c-2.3 0-4.1 1.9-4.1 4.1 0 2.3 1.9 4.1 4.1 4.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <g className={styles["earHair"]}>
                <rect x="51" y="64" fill="#FFFFFF" width="15" height="35" />
                <path
                  d="M53.4 62.8C48.5 67.4 45 72.2 42.8 77c3.4-.1 6.8-.1 10.1.1-4 3.7-6.8 7.6-8.2 11.6 2.1 0 4.2 0 6.3.2-2.6 4.1-3.8 8.3-3.7 12.5 1.2-.7 3.4-1.4 5.2-1.9"
                  fill="#fff"
                  stroke="#3a5e77"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </g>
            <g className={styles["earR"]}>
              <g className={styles["outerEar"]}>
                <circle
                  fill="#DDF1FA"
                  stroke="#3A5E77"
                  strokeWidth="2.5"
                  cx="153"
                  cy="83"
                  r="11.5"
                />
                <path
                  fill="#DDF1FA"
                  stroke="#3A5E77"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M153.7,78.9 c2.3,0,4.1,1.9,4.1,4.1c0,2.3-1.9,4.1-4.1,4.1"
                />
              </g>
              <g className={styles["earHair"]}>
                <rect x="134" y="64" fill="#FFFFFF" width="15" height="35" />
                <path
                  fill="#FFFFFF"
                  stroke="#3A5E77"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M146.6,62.8 c4.9,4.6,8.4,9.4,10.6,14.2c-3.4-0.1-6.8-0.1-10.1,0.1c4,3.7,6.8,7.6,8.2,11.6c-2.1,0-4.2,0-6.3,0.2c2.6,4.1,3.8,8.3,3.7,12.5 c-1.2-0.7-3.4-1.4-5.2-1.9"
                />
              </g>
            </g>
            <path
              className={styles["chin"]}
              d="M84.1 121.6c2.7 2.9 6.1 5.4 9.8 7.5l.9-4.5c2.9 2.5 6.3 4.8 10.2 6.5 0-1.9-.1-3.9-.2-5.8 3 1.2 6.2 2 9.7 2.5-.3-2.1-.7-4.1-1.2-6.1"
              fill="none"
              stroke="#3a5e77"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <g className={styles["faceAndHair"]}>
              <path
                className={styles["face"]}
                fill="#DDF1FA"
                d="M134.5,46v35.5c0,21.815-15.446,39.5-34.5,39.5s-34.5-17.685-34.5-39.5V46"
              />
              <path
                className={styles["hair"]}
                fill="#FFFFFF"
                stroke="#3A5E77"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M81.457,27.929 c1.755-4.084,5.51-8.262,11.253-11.77c0.979,2.565,1.883,5.14,2.712,7.723c3.162-4.265,8.626-8.27,16.272-11.235 c-0.737,3.293-1.588,6.573-2.554,9.837c4.857-2.116,11.049-3.64,18.428-4.156c-2.403,3.23-5.021,6.391-7.852,9.474"
              />
              <g className={styles["eyebrow"]}>
                <path
                  fill="#FFFFFF"
                  d="M138.142,55.064c-4.93,1.259-9.874,2.118-14.787,2.599c-0.336,3.341-0.776,6.689-1.322,10.037 c-4.569-1.465-8.909-3.222-12.996-5.226c-0.98,3.075-2.07,6.137-3.267,9.179c-5.514-3.067-10.559-6.545-15.097-10.329 c-1.806,2.889-3.745,5.73-5.816,8.515c-7.916-4.124-15.053-9.114-21.296-14.738l1.107-11.768h73.475V55.064z"
                />
                <path
                  fill="#FFFFFF"
                  stroke="#3A5E77"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M63.56,55.102 c6.243,5.624,13.38,10.614,21.296,14.738c2.071-2.785,4.01-5.626,5.816-8.515c4.537,3.785,9.583,7.263,15.097,10.329 c1.197-3.043,2.287-6.104,3.267-9.179c4.087,2.004,8.427,3.761,12.996,5.226c0.545-3.348,0.986-6.696,1.322-10.037 c4.913-0.481,9.857-1.34,14.787-2.599"
                />
              </g>
            </g>
            <g className={styles["eyeL"]}>
              <circle cx="85.5" cy="78.5" r="3.5" fill="#3a5e77" />
              <circle cx="84" cy="76" r="1" fill="#fff" />
            </g>
            <g className={styles["eyeR"]}>
              <circle cx="114.5" cy="78.5" r="3.5" fill="#3a5e77" />
              <circle cx="113" cy="76" r="1" fill="#fff" />
            </g>
            <g className={styles["mouth"]}>
              <path
                className={styles["mouthBG"]}
                fill="#617E92"
                d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z"
              />
              <path
                className={styles["mouthOutline"]}
                fill="none"
                stroke="#3A5E77"
                strokeWidth="2.5"
                strokeLinejoin="round"
                d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z"
              />
            </g>
            <path
              className={styles["nose"]}
              d="M97.7 79.9h4.7c1.9 0 3 2.2 1.9 3.7l-2.3 3.3c-.9 1.3-2.9 1.3-3.8 0l-2.3-3.3c-1.3-1.6-.2-3.7 1.8-3.7z"
              fill="#3a5e77"
            />
          </svg>
        </div>

        {message && (
          <div
            className={`${styles["forgot-message"]} ${
              isSuccess ? styles["success"] : styles["error"]
            }`}
          >
            {message}
          </div>
        )}

        <label htmlFor="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email của bạn"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="resetToken">Mã xác thực:</label>
        <input
          id="resetToken"
          name="resetToken"
          type="text"
          placeholder="Nhập mã 6 chữ số"
          value={formData.resetToken}
          onChange={handleChange}
          maxLength={6}
          required
        />

        <label htmlFor="newPassword">Mật khẩu mới:</label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="Nhập mật khẩu mới"
          value={formData.newPassword}
          onChange={handleChange}
          required
        />

        <label htmlFor="confirmPassword">Xác nhận mật khẩu:</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className={`${styles["forgot-button"]} ${isLoading ? styles["loading"] : ""}`}
          disabled={isLoading}
        >
          {!isLoading && <FontAwesomeIcon icon={faKey} />}
          <span className="button-text">{isLoading ? "" : "Đặt lại mật khẩu"}</span>
        </button>

        <p className={styles["forgot-bottom"]}>
          <span onClick={() => navigate("/login")}>
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại đăng nhập
          </span>
        </p>
      </form>
    </div>
  );
}
