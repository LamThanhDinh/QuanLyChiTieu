import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
import logo from "../assets/login/logo.png";
import bg from "../assets/login/background.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { login } from "../api/authService";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);

  // Yeti eye tracking calculations based on yeti.js
  const calculateEyePosition = () => {
    const username = formData.username;
    const length = username.length;

    // Simulate caret position tracking like in original yeti.js
    let eyeLX = 0,
      eyeLY = 0,
      eyeRX = 0,
      eyeRY = 0;

    if (length > 0) {
      // Calculate angles based on username length (simulating caret position)
      const maxLength = 20; // Maximum tracking length
      const normalizedLength = Math.min(length, maxLength);

      // Calculate eye movement angles
      const eyeLAngle = (normalizedLength / maxLength) * 0.5 - 0.25; // -0.25 to 0.25 radians
      const eyeRAngle = (normalizedLength / maxLength) * 0.5 - 0.25;

      eyeLX = Math.cos(eyeLAngle) * 20;
      eyeLY = Math.sin(eyeLAngle) * 10;
      eyeRX = Math.cos(eyeRAngle) * 20;
      eyeRY = Math.sin(eyeRAngle) * 10;
    }

    return {
      eyeLX: -eyeLX,
      eyeLY: -eyeLY,
      eyeRX: -eyeRX,
      eyeRY: -eyeRY,
    };
  };

  const calculateFacialPosition = () => {
    const username = formData.username;
    const length = username.length;

    let noseX = 0,
      noseY = 0,
      mouthX = 0,
      mouthY = 0,
      mouthR = 0;
    let chinX = 0,
      chinY = 0,
      faceX = 0,
      faceY = 0,
      faceSkew = 0;

    if (length > 0) {
      const maxLength = 20;
      const normalizedLength = Math.min(length, maxLength);
      const angle = (normalizedLength / maxLength) * 0.5 - 0.25;

      noseX = Math.cos(angle) * 23;
      noseY = Math.sin(angle) * 10;
      mouthX = Math.cos(angle) * 23;
      mouthY = Math.sin(angle) * 10;
      mouthR = Math.cos(angle) * 6;
      chinX = mouthX * 0.8;
      chinY = mouthY * 0.5;
      faceX = mouthX * 0.3;
      faceY = mouthY * 0.4;
      faceSkew = Math.cos(angle) * 5;
    }

    return {
      x: -faceX,
      y: -faceY,
      noseX: -noseX,
      noseY: -noseY,
      mouthX: -mouthX,
      mouthY: -mouthY,
      mouthR,
      chinX: -chinX,
      chinY: -chinY,
      faceSkew: -faceSkew,
    };
  };

  const eyePosition = calculateEyePosition();
  const facialPosition = calculateFacialPosition();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear message when user types
    if (message) setMessage("");
  };

  const handlePasswordFocus = () => {
    setIsPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    setIsPasswordFocused(false);
  };

  const handleUsernameFocus = () => {
    setIsUsernameFocused(true);
  };

  const handleUsernameBlur = () => {
    setIsUsernameFocused(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await login(formData);
      const { token, account } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(account));

      setIsSuccess(true);
      setMessage("Đăng nhập thành công! Đang chuyển hướng...");

      // Navigate trực tiếp sau 1 giây
      setTimeout(() => {
        navigate("/homepage");
      }, 1000);
    } catch (error) {
      setIsSuccess(false);
      const errorMessage =
        error.response?.data?.message ||
        "Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.";
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={styles["login-container"]}
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className={styles["login-left"]}>
        <img src={logo} alt="logo" className={styles["login-logo"]} />
        <h1 className={styles["login-title"]}>KÉT SẮT SỐ</h1>
        <p className={styles["login-desc"]}>
          Đăng nhập để bắt đầu quản lí thông minh cùng KÉT SẮT SỐ
        </p>
      </div>

      <form className={styles["login-form-box"]} onSubmit={handleLogin}>
        {/* Yeti SVG Container */}
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
                className={styles["bodyBGchanged"]}
                style={{
                  display:
                    formData.password || isPasswordFocused ? "block" : "none",
                }}
                fill="#FFFFFF"
                d="M200,122h-35h-14.9V72c0-27.6-22.4-50-50-50s-50,22.4-50,50v50H35.8H0l0,91h200L200,122z"
              />
              <path
                className={styles["bodyBGnormal"]}
                style={{
                  display:
                    formData.password || isPasswordFocused ? "none" : "block",
                }}
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
            <g
              className={styles["faceAndHair"]}
              style={{
                transform: `translate(${facialPosition.x}px, ${facialPosition.y}px) skewX(${facialPosition.faceSkew}deg)`,
                transformOrigin: "center top",
              }}
            >
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
              <circle
                cx="85.5"
                cy="78.5"
                r="3.5"
                fill="#3a5e77"
                style={{
                  transform: `translate(${eyePosition.eyeLX}px, ${eyePosition.eyeLY}px)`,
                  transformOrigin: "center center",
                }}
              />
              <circle
                cx="84"
                cy="76"
                r="1"
                fill="#fff"
                style={{
                  transform: `translate(${eyePosition.eyeLX}px, ${eyePosition.eyeLY}px)`,
                  transformOrigin: "center center",
                }}
              />
            </g>
            <g className={styles["eyeR"]}>
              <circle
                cx="114.5"
                cy="78.5"
                r="3.5"
                fill="#3a5e77"
                style={{
                  transform: `translate(${eyePosition.eyeRX}px, ${eyePosition.eyeRY}px)`,
                  transformOrigin: "center center",
                }}
              />
              <circle
                cx="113"
                cy="76"
                r="1"
                fill="#fff"
                style={{
                  transform: `translate(${eyePosition.eyeRX}px, ${eyePosition.eyeRY}px)`,
                  transformOrigin: "center center",
                }}
              />
            </g>
            <g className={styles["mouth"]}>
              <path
                className={styles["mouthBG"]}
                fill="#617E92"
                d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z"
                style={{
                  transform: `translate(${facialPosition.mouthX}px, ${facialPosition.mouthY}px) rotate(${facialPosition.mouthR}deg)`,
                  transformOrigin: "center center",
                }}
              />
              <path
                className={styles["mouthOutline"]}
                fill="none"
                stroke="#3A5E77"
                strokeWidth="2.5"
                strokeLinejoin="round"
                d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z"
                style={{
                  transform: `translate(${facialPosition.mouthX}px, ${facialPosition.mouthY}px) rotate(${facialPosition.mouthR}deg)`,
                  transformOrigin: "center center",
                }}
              />
            </g>
            <path
              className={styles["nose"]}
              d="M97.7 79.9h4.7c1.9 0 3 2.2 1.9 3.7l-2.3 3.3c-.9 1.3-2.9 1.3-3.8 0l-2.3-3.3c-1.3-1.6-.2-3.7 1.8-3.7z"
              fill="#3a5e77"
              style={{
                transform: `translate(${facialPosition.noseX}px, ${facialPosition.noseY}px) rotate(${facialPosition.mouthR}deg)`,
                transformOrigin: "center center",
              }}
            />
            <g className={styles["arms"]} clipPath="url(#armMask)">
              <g
                className={`${styles["armL"]} ${
                  formData.password || isPasswordFocused
                    ? styles["covering"]
                    : styles["hidden"]
                }`}
                style={{
                  visibility:
                    formData.password || isPasswordFocused
                      ? "visible"
                      : "hidden",
                }}
              >
                <polygon
                  fill="#DDF1FA"
                  stroke="#3A5E77"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                  points="121.3,98.4 111,59.7 149.8,49.3 169.8,85.4"
                />
                <path
                  fill="#DDF1FA"
                  stroke="#3A5E77"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                  d="M134.4,53.5l19.3-5.2c2.7-0.7,5.4,0.9,6.1,3.5v0c0.7,2.7-0.9,5.4-3.5,6.1l-10.3,2.8"
                />
                <path
                  fill="#DDF1FA"
                  stroke="#3A5E77"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                  d="M150.9,59.4l26-7c2.7-0.7,5.4,0.9,6.1,3.5v0c0.7,2.7-0.9,5.4-3.5,6.1l-21.3,5.7"
                />
                <g className={styles["twoFingers"]}>
                  <path
                    fill="#DDF1FA"
                    stroke="#3A5E77"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M158.3,67.8l23.1-6.2c2.7-0.7,5.4,0.9,6.1,3.5v0c0.7,2.7-0.9,5.4-3.5,6.1l-23.1,6.2"
                  />
                  <path
                    fill="#A9DDF3"
                    d="M180.1,65l2.2-0.6c1.1-0.3,2.2,0.3,2.4,1.4v0c0.3,1.1-0.3,2.2-1.4,2.4l-2.2,0.6L180.1,65z"
                  />
                  <path
                    fill="#DDF1FA"
                    stroke="#3A5E77"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M160.8,77.5l19.4-5.2c2.7-0.7,5.4,0.9,6.1,3.5v0c0.7,2.7-0.9,5.4-3.5,6.1l-18.3,4.9"
                  />
                  <path
                    fill="#A9DDF3"
                    d="M178.8,75.7l2.2-0.6c1.1-0.3,2.2,0.3,2.4,1.4v0c0.3,1.1-0.3,2.2-1.4,2.4l-2.2,0.6L178.8,75.7z"
                  />
                </g>
                <path
                  fill="#A9DDF3"
                  d="M175.5,55.9l2.2-0.6c1.1-0.3,2.2,0.3,2.4,1.4v0c0.3,1.1-0.3,2.2-1.4,2.4l-2.2,0.6L175.5,55.9z"
                />
                <path
                  fill="#A9DDF3"
                  d="M152.1,50.4l2.2-0.6c1.1-0.3,2.2,0.3,2.4,1.4v0c0.3,1.1-0.3,2.2-1.4,2.4l-2.2,0.6L152.1,50.4z"
                />
              </g>
              <g
                className={`${styles["armR"]} ${
                  formData.password || isPasswordFocused
                    ? styles["covering"]
                    : styles["hidden"]
                }`}
                style={{
                  visibility:
                    formData.password || isPasswordFocused
                      ? "visible"
                      : "hidden",
                  transitionDelay:
                    formData.password || isPasswordFocused ? "0.1s" : "0s",
                }}
              >
                <polygon
                  fill="#DDF1FA"
                  stroke="#3A5E77"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                  points="265.4,97.3 275.8,58.7 237,48.2 217,84.3"
                />
                <path
                  fill="#DDF1FA"
                  stroke="#3A5E77"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                  d="M252.4,52.4L233,47.2c-2.7-0.7-5.4,0.9-6.1,3.5v0c-0.7,2.7,0.9,5.4,3.5,6.1l10.3,2.8"
                />
                <path
                  fill="#DDF1FA"
                  stroke="#3A5E77"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                  d="M235.8,58.3l-26-7c-2.7-0.7-5.4,0.9-6.1,3.5v0c-0.7,2.7,0.9,5.4,3.5,6.1l21.3,5.7"
                />
                <path
                  fill="#DDF1FA"
                  stroke="#3A5E77"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M228.4,66.7l-23.1-6.2c-2.7-0.7-5.4,0.9-6.1,3.5v0c-0.7,2.7,0.9,5.4,3.5,6.1l23.1,6.2"
                />
                <path
                  fill="#A9DDF3"
                  d="M207.9,74.7l-2.2-0.6c-1.1-0.3-2.2,0.3-2.4,1.4v0c-0.3,1.1,0.3,2.2,1.4,2.4l2.2,0.6L207.9,74.7z"
                />
                <path
                  fill="#DDF1FA"
                  stroke="#3A5E77"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M226,76.4l-19.4-5.2c-2.7-0.7-5.4,0.9-6.1,3.5v0c-0.7,2.7,0.9,5.4,3.5,6.1l18.3,4.9"
                />
                <path
                  fill="#A9DDF3"
                  d="M206.7,64l-2.2-0.6c-1.1-0.3-2.2,0.3-2.4,1.4v0c-0.3,1.1,0.3,2.2,1.4,2.4l2.2,0.6L206.7,64z"
                />
                <path
                  fill="#A9DDF3"
                  d="M211.2,54.8l-2.2-0.6c-1.1-0.3-2.2,0.3-2.4,1.4v0c-0.3,1.1,0.3,2.2,1.4,2.4l2.2,0.6L211.2,54.8z"
                />
                <path
                  fill="#A9DDF3"
                  d="M234.6,49.4l-2.2-0.6c-1.1-0.3-2.2,0.3-2.4,1.4v0c-0.3,1.1,0.3,2.2,1.4,2.4l2.2,0.6L234.6,49.4z"
                />
              </g>
            </g>
          </svg>
        </div>

        {message && (
          <div
            className={`${styles["login-message"]} ${
              isSuccess ? styles["success"] : styles["error"]
            }`}
          >
            {message}
          </div>
        )}

        <label
          htmlFor="username"
          className={isUsernameFocused ? styles.focused : ""}
        >
          Tên tài khoản:
        </label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Nhập tên tài khoản của bạn"
          value={formData.username}
          onChange={handleChange}
          onFocus={handleUsernameFocus}
          onBlur={handleUsernameBlur}
          required
        />

        <label
          htmlFor="password"
          className={isPasswordFocused ? styles.focused : ""}
        >
          Mật khẩu:
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Nhập mật khẩu của bạn"
          value={formData.password}
          onChange={handleChange}
          onFocus={handlePasswordFocus}
          onBlur={handlePasswordBlur}
          required
        />

        <button
          type="submit"
          className={`${styles["login-button"]} ${isLoading ? styles["loading"] : ""}`}
          disabled={isLoading}
        >
          {!isLoading && <FontAwesomeIcon icon={faSignInAlt} />}
          <span className="button-text">{isLoading ? "" : "Đăng nhập"}</span>
        </button>

        <p className={styles["login-bottom"]}>
          <span onClick={() => navigate("/forgot-password")}>
            Quên mật khẩu?
          </span>
        </p>

        <p className={styles["login-bottom"]}>
          <span onClick={() => navigate("/register")}>
            Bạn chưa có tài khoản?
          </span>
        </p>
      </form>
    </div>
  );
}
