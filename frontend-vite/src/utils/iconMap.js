// src/utils/iconMap.js (hoặc đặt trong CategoryList.jsx nếu muốn)
import {
  faUtensils,
  faShoppingCart,
  faShoppingBag,
  faCar,
  faHome,
  faFileInvoiceDollar,
  faMoneyBillWave,
  faGift,
  faPiggyBank,
  faBus,
  faTshirt,
  faGasPump,
  faHeartbeat,
  faBook,
  faGraduationCap,
  faPaw,
  faPlane,
  faPlaneDeparture,
  faTrain,
  faHospital,
  faFilm,
  faMusic,
  faGamepad,
  faQuestionCircle,
  faPlusCircle,
  faMinusCircle,
  faReceipt,
  faHandHoldingUsd,
  faWallet,
  faCreditCard,
  faLandmark,
  faTools,
  faBolt,
  faWifi,
  faMobileAlt,
  faGlassCheers,
  faStore,
  faTree,
  faSeedling,
  faChartLine,
  faUsers,
  faCoffee,
  faHamburger,
  faAppleAlt,
  faCake,
  faIceCream,
  faBicycle,
  faMotorcycle,
  faTaxi,
  faShip,
  faHelicopter,
  faBed,
  faBath,
  faCouch,
  faLightbulb,
  faThermometerFull,
  faFan,
  faShirt,
  faGem,
  faRing,
  faGlasses,
  faRunning,
  faFootballBall,
  faBasketballBall,
  faDumbbell,
  faSwimmer,
  faPills,
  faStethoscope,
  faTooth,
  faEye,
  faLaptop,
  faDesktop,
  faKeyboard,
  faMouse,
  faTabletAlt,
  faCamera,
  faHeadphones,
  faMicrophone,
  faTv,
  faChess,
  faGuitar,
  faDrum,
  faPaintBrush,
  faPalette,
  faStar,
  faHeart,
  faBalanceScale,
  faHandshake,
  faBuilding,
  faMapMarker,
  faGlobe,
  faFlag,
  faMedal,
  faTrophy,
  faCrown,
  faFire,
  faSnowflake,
  faSun,
  faMoon,
  faCloud,
  faUmbrella,
  faRocket,
  faMagic,
  faKey,
  faLock,
  faShield,
  faCogs,
  faWrench,
  faHammer,
  faScrewdriver,
  faCut,
  faFlask,
  faMicroscope,
  faAtom,
  faDna,
  faLeaf,
  faCat,
  faDog,
  faHorse,
  faFish,
  faCarrot,
  faBreadSlice,
  faWineGlass,
  faBeer,
  faCocktail,
  //faTarget,
  //faWatch,
  //faPepper,
  //faPizza,
  faBullseye, // Thay thế cho faTarget nếu muốn, hoặc dùng faCrosshairs
  faClock, // Thay thế cho faWatch (bản Pro)
  faPepperHot, // Thay thế cho faPepper
  faPizzaSlice, // Thay thế cho faPizza
} from "@fortawesome/free-solid-svg-icons";

export const iconMap = {
  // Thu nhập
  "fa-money-bill-wave": faMoneyBillWave, // Lương
  "fa-gift": faGift, // Quà tặng, Thưởng
  "fa-hand-holding-usd": faHandHoldingUsd, // Thu nhập khác, Đầu tư
  "fa-piggy-bank": faPiggyBank, // Tiết kiệm (ICON MẶC ĐỊNH CHO GOALS)
  "fa-chart-line": faChartLine, // Đầu tư
  "fa-handshake": faHandshake, // Thu nhập từ hợp đồng
  "fa-building": faBuilding, // Thu nhập từ bất động sản
  "fa-trophy": faTrophy, // Thưởng, giải thưởng

  // Chi tiêu - Ăn uống & Thực phẩm
  "fa-utensils": faUtensils, // Ăn uống, Nhà hàng
  "fa-coffee": faCoffee, // Cà phê, đồ uống
  "fa-pizza": faPizzaSlice, // Pizza, đồ ăn nhanh (alias)
  "fa-pizza-slice": faPizzaSlice, // Pizza, đồ ăn nhanh
  "fa-hamburger": faHamburger, // Hamburger, fast food
  "fa-apple-alt": faAppleAlt, // Trái cây, thực phẩm tươi
  "fa-cake": faCake, // Bánh ngọt, dessert
  "fa-ice-cream": faIceCream, // Kem, đồ uống lạnh
  "fa-bread-slice": faBreadSlice, // Bánh mì, thực phẩm cơ bản
  "fa-carrot": faCarrot, // Rau củ
  "fa-pepper": faPepperHot, // Gia vị, rau củ (alias)
  "fa-pepper-hot": faPepperHot, // Gia vị, rau củ
  "fa-wine-glass": faWineGlass, // Rượu vang
  "fa-beer": faBeer, // Bia
  "fa-cocktail": faCocktail, // Cocktail, đồ uống có cồn
  "fa-shopping-cart": faShoppingCart, // Đi chợ, Thực phẩm

  // Chi tiêu - Di chuyển & Giao thông
  "fa-car": faCar, // Xe cộ, Xăng dầu
  "fa-gas-pump": faGasPump, // Xăng dầu
  "fa-bus": faBus, // Phương tiện công cộng
  "fa-train": faTrain, // Tàu hỏa
  "fa-plane": faPlane, // Máy bay, Du lịch
  "fa-plane-departure": faPlaneDeparture, // Du lịch
  "fa-bicycle": faBicycle, // Xe đạp
  "fa-motorcycle": faMotorcycle, // Xe máy
  "fa-taxi": faTaxi, // Taxi
  "fa-ship": faShip, // Tàu thủy
  "fa-helicopter": faHelicopter, // Trực thăng

  // Chi tiêu - Nhà cửa & Tiện ích
  "fa-home": faHome, // Nhà cửa, Tiền thuê
  "fa-file-invoice-dollar": faFileInvoiceDollar, // Hóa đơn (điện, nước, internet)
  "fa-bolt": faBolt, // Điện
  "fa-wifi": faWifi, // Internet
  "fa-tools": faTools, // Sửa chữa nhà cửa
  "fa-bed": faBed, // Nội thất phòng ngủ
  "fa-bath": faBath, // Phòng tắm, vệ sinh
  "fa-couch": faCouch, // Nội thất phòng khách
  "fa-lightbulb": faLightbulb, // Đèn, thiết bị điện
  "fa-thermometer-half": faThermometerFull, // Điều hòa, sưởi ấm (using faThermometerFull as substitute)
  "fa-fan": faFan, // Quạt, thiết bị làm mát

  // Chi tiêu - Thời trang & Phụ kiện
  "fa-tshirt": faTshirt, // Quần áo
  "fa-shirt": faShirt, // Áo sơ mi, trang phục công sở
  "fa-gem": faGem, // Trang sức, đá quý
  "fa-ring": faRing, // Nhẫn, trang sức
  "fa-watch": faClock, // Đồng hồ (alias)
  "fa-clock": faClock, // Đồng hồ
  "fa-glasses": faGlasses, // Kính mắt
  "fa-store": faStore, // Mua sắm chung
  "fa-shopping-bag": faShoppingBag, // Mua sắm

  // Chi tiêu - Sức khỏe & Y tế
  "fa-heartbeat": faHeartbeat, // Sức khỏe, Thuốc men
  "fa-hospital": faHospital, // Bệnh viện, Khám bệnh
  "fa-pills": faPills, // Thuốc, dược phẩm
  "fa-stethoscope": faStethoscope, // Khám bệnh, bác sĩ
  "fa-tooth": faTooth, // Nha khoa
  "fa-eye": faEye, // Mắt, nhãn khoa
  "fa-running": faRunning, // Thể dục, fitness
  "fa-dumbbell": faDumbbell, // Gym, tập gym
  "fa-swimmer": faSwimmer, // Bơi lội
  "fa-football-ball": faFootballBall, // Bóng đá
  "fa-basketball-ball": faBasketballBall, // Bóng rổ

  // Chi tiêu - Giáo dục & Học tập
  "fa-book": faBook, // Sách vở
  "fa-graduation-cap": faGraduationCap, // Giáo dục, Học phí
  "fa-laptop": faLaptop, // Laptop, máy tính
  "fa-desktop": faDesktop, // Máy tính để bàn
  "fa-tablet-alt": faTabletAlt, // Tablet
  "fa-keyboard": faKeyboard, // Phụ kiện máy tính
  "fa-mouse": faMouse, // Chuột máy tính

  // Chi tiêu - Giải trí & Công nghệ
  "fa-film": faFilm, // Giải trí, Xem phim
  "fa-music": faMusic, // Âm nhạc
  "fa-gamepad": faGamepad, // Trò chơi
  "fa-controller": faGamepad, // Game controller (using faGamepad as substitute)
  "fa-chess": faChess, // Cờ vua, trò chơi trí tuệ
  "fa-guitar": faGuitar, // Guitar, nhạc cụ
  "fa-drum": faDrum, // Trống, nhạc cụ
  "fa-camera": faCamera, // Máy ảnh
  "fa-headphones": faHeadphones, // Tai nghe
  "fa-microphone": faMicrophone, // Microphone
  "fa-tv": faTv, // TV, giải trí

  // Chi tiêu - Xã hội & Gia đình
  "fa-users": faUsers, // Gia đình
  "fa-glass-cheers": faGlassCheers, // Bạn bè, Tụ tập
  "fa-paw": faPaw, // Thú cưng
  "fa-cat": faCat, // Mèo
  "fa-dog": faDog, // Chó
  "fa-horse": faHorse, // Ngựa
  "fa-fish": faFish, // Cá
  "fa-mobile-alt": faMobileAlt, // Điện thoại, Cước điện thoại

  // Chi tiêu - Sở thích & Khác
  "fa-tree": faTree, // Từ thiện, môi trường
  "fa-seedling": faSeedling, // Làm vườn, sở thích
  "fa-leaf": faLeaf, // Cây cối, môi trường
  "fa-paint-brush": faPaintBrush, // Vẽ, nghệ thuật
  "fa-palette": faPalette, // Màu sắc, nghệ thuật
  "fa-star": faStar, // Ngôi sao, đánh giá
  "fa-heart": faHeart, // Trái tim, yêu thích
  "fa-present": faGift, // Quà tặng (using faGift as substitute)

  // Giao dịch & Tài khoản
  "fa-receipt": faReceipt, // Giao dịch, Hóa đơn chung
  "fa-wallet": faWallet, // Ví tiền/quỹ
  "fa-credit-card": faCreditCard, // Thẻ tín dụng/ghi nợ
  "fa-landmark": faLandmark, // Ngân hàng
  "fa-balance-scale": faBalanceScale, // Cân đối, tài chính

  // Mục tiêu & Thành tựu
  "fa-target": faBullseye, // Mục tiêu (alias)
  "fa-bullseye": faBullseye, // Mục tiêu, hoàn thành
  "fa-rocket": faRocket, // Khởi nghiệp, tăng trưởng
  "fa-medal": faMedal, // Huy chương, thành tích
  "fa-crown": faCrown, // Vương miện, cao cấp
  "fa-magic": faMagic, // Phép thuật, đặc biệt

  // Thời tiết & Môi trường
  "fa-sun": faSun, // Mặt trời, mùa hè
  "fa-moon": faMoon, // Mặt trăng, đêm
  "fa-cloud-rain": faCloud, // Mưa (using faCloud as substitute)
  "fa-umbrella": faUmbrella, // Ô, đồ dùng mưa
  "fa-fire-alt": faFire, // Lửa, sưởi ấm (using faFire as substitute)
  "fa-snowflake": faSnowflake, // Tuyết, mùa đông

  // Công cụ & Kỹ thuật
  "fa-wrench": faWrench, // Cờ lê, sửa chữa
  "fa-hammer": faHammer, // Búa, xây dựng
  "fa-screwdriver": faScrewdriver, // Tuốc nơ vít
  "fa-cut": faCut, // Cắt, dụng cụ
  "fa-cogs": faCogs, // Bánh răng, kỹ thuật
  "fa-key": faKey, // Chìa khóa
  "fa-lock": faLock, // Khóa, bảo mật
  "fa-shield": faShield, // Khiên, bảo vệ

  // Khoa học & Nghiên cứu
  "fa-flask": faFlask, // Bình thí nghiệm
  "fa-microscope": faMicroscope, // Kính hiển vi
  "fa-atom": faAtom, // Nguyên tử, khoa học
  "fa-dna": faDna, // DNA, sinh học

  // Địa lý & Du lịch
  "fa-map-marker-alt": faMapMarker, // Vị trí, địa điểm (using faMapMarker as substitute)
  "fa-globe-americas": faGlobe, // Thế giới, quốc tế (using faGlobe as substitute)
  "fa-flag": faFlag, // Cờ, quốc gia

  // Mặc định & Thêm/Bớt
  "fa-plus-circle": faPlusCircle, // Thêm mới
  "fa-minus-circle": faMinusCircle, // Bớt, Xóa
  default: faBullseye, // ICON MẶC ĐỊNH CHO GOALS - mục tiêu

  "fa-question-circle": faQuestionCircle, // Icon không xác định
  "fa-bank": faLandmark, // Ngân hàng/quỹ (alias)
};

export const getIconObject = (iconName) => {
  return iconMap[iconName] || iconMap["default"];
};

// Hàm thông minh để render cả emoji và FontAwesome icon
export const isEmoji = (str) => {
  // Kiểm tra xem có phải emoji không bằng regex
  const emojiRegex =
    /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u;
  return emojiRegex.test(str);
};

export const renderIcon = (iconName) => {
  // Nếu không có icon, dùng mặc định emoji đẹp
  if (!iconName) {
    return { type: "emoji", content: "🎯" };
  }

  // Nếu là emoji, trả về emoji
  if (isEmoji(iconName)) {
    return { type: "emoji", content: iconName };
  }

  // Nếu bắt đầu với "fa-", trả về FontAwesome object
  if (iconName.startsWith("fa-")) {
    return {
      type: "fontawesome",
      content: getIconObject(iconName),
    };
  }

  // Mặc định trả về emoji đẹp
  return { type: "emoji", content: "🎯" };
};

// Danh sách icon có sẵn để người dùng chọn khi tạo/sửa danh mục
export const availableIconsForSelection = [
  // Mục tiêu & Tiết kiệm (ưu tiên cao nhất)
  { name: "Mục tiêu", identifier: "fa-bullseye" },
  { name: "Ống heo tiết kiệm", identifier: "fa-piggy-bank" },
  { name: "Rocket", identifier: "fa-rocket" },
  { name: "Huy chương", identifier: "fa-medal" },
  { name: "Cúp", identifier: "fa-trophy" },
  { name: "Ngôi sao", identifier: "fa-star" },
  { name: "Trái tim", identifier: "fa-heart" },
  { name: "Vương miện", identifier: "fa-crown" },
  { name: "Đặc biệt", identifier: "fa-magic" },

  // Thu nhập (màu xanh)
  { name: "Lương", identifier: "fa-money-bill-wave" },
  { name: "Quà tặng", identifier: "fa-gift" },
  { name: "Đầu tư", identifier: "fa-chart-line" },
  { name: "Hợp đồng", identifier: "fa-handshake" },
  { name: "Bất động sản", identifier: "fa-building" },

  // Ăn uống & Thực phẩm
  { name: "Ăn uống", identifier: "fa-utensils" },
  { name: "Cà phê", identifier: "fa-coffee" },
  { name: "Pizza", identifier: "fa-pizza-slice" },
  { name: "Hamburger", identifier: "fa-hamburger" },
  { name: "Trái cây", identifier: "fa-apple-alt" },
  { name: "Bánh ngọt", identifier: "fa-cake" },
  { name: "Kem", identifier: "fa-ice-cream" },
  { name: "Bánh mì", identifier: "fa-bread-slice" },
  { name: "Rau củ", identifier: "fa-carrot" },
  { name: "Gia vị", identifier: "fa-pepper-hot" },
  { name: "Rượu vang", identifier: "fa-wine-glass" },
  { name: "Bia", identifier: "fa-beer" },
  { name: "Cocktail", identifier: "fa-cocktail" },
  { name: "Đi chợ", identifier: "fa-shopping-cart" },

  // Giao thông & Di chuyển
  { name: "Xe cộ", identifier: "fa-car" },
  { name: "Xe máy", identifier: "fa-motorcycle" },
  { name: "Xe đạp", identifier: "fa-bicycle" },
  { name: "Xăng dầu", identifier: "fa-gas-pump" },
  { name: "Xe buýt", identifier: "fa-bus" },
  { name: "Tàu hỏa", identifier: "fa-train" },
  { name: "Máy bay", identifier: "fa-plane" },
  { name: "Du lịch", identifier: "fa-plane-departure" },
  { name: "Taxi", identifier: "fa-taxi" },
  { name: "Tàu thủy", identifier: "fa-ship" },
  { name: "Trực thăng", identifier: "fa-helicopter" },

  // Nhà cửa & Tiện ích
  { name: "Nhà cửa", identifier: "fa-home" },
  { name: "Hóa đơn", identifier: "fa-file-invoice-dollar" },
  { name: "Điện", identifier: "fa-bolt" },
  { name: "Internet", identifier: "fa-wifi" },
  { name: "Sửa chữa", identifier: "fa-tools" },
  { name: "Giường", identifier: "fa-bed" },
  { name: "Phòng tắm", identifier: "fa-bath" },
  { name: "Sofa", identifier: "fa-couch" },
  { name: "Đèn", identifier: "fa-lightbulb" },
  { name: "Nhiệt độ", identifier: "fa-thermometer-half" },
  { name: "Quạt", identifier: "fa-fan" },

  // Thời trang & Mua sắm
  { name: "Quần áo", identifier: "fa-tshirt" },
  { name: "Áo sơ mi", identifier: "fa-shirt" },
  { name: "Trang sức", identifier: "fa-gem" },
  { name: "Nhẫn", identifier: "fa-ring" },
  { name: "Đồng hồ", identifier: "fa-clock" },
  { name: "Kính mắt", identifier: "fa-glasses" },
  { name: "Cửa hàng", identifier: "fa-store" },
  { name: "Mua sắm", identifier: "fa-shopping-bag" },

  // Sức khỏe & Y tế
  { name: "Tim mạch", identifier: "fa-heartbeat" },
  { name: "Bệnh viện", identifier: "fa-hospital" },
  { name: "Thuốc men", identifier: "fa-pills" },
  { name: "Bác sĩ", identifier: "fa-stethoscope" },
  { name: "Nha khoa", identifier: "fa-tooth" },
  { name: "Mắt", identifier: "fa-eye" },
  { name: "Chạy bộ", identifier: "fa-running" },
  { name: "Gym", identifier: "fa-dumbbell" },
  { name: "Bơi lội", identifier: "fa-swimmer" },
  { name: "Bóng đá", identifier: "fa-football-ball" },
  { name: "Bóng rổ", identifier: "fa-basketball-ball" },

  // Giáo dục & Công nghệ
  { name: "Tốt nghiệp", identifier: "fa-graduation-cap" },
  { name: "Sách", identifier: "fa-book" },
  { name: "Laptop", identifier: "fa-laptop" },
  { name: "Máy tính", identifier: "fa-desktop" },
  { name: "Tablet", identifier: "fa-tablet-alt" },
  { name: "Bàn phím", identifier: "fa-keyboard" },
  { name: "Chuột", identifier: "fa-mouse" },

  // Giải trí & Sở thích
  { name: "Phim ảnh", identifier: "fa-film" },
  { name: "Âm nhạc", identifier: "fa-music" },
  { name: "Game", identifier: "fa-gamepad" },
  { name: "Game Controller", identifier: "fa-controller" },
  { name: "Cờ vua", identifier: "fa-chess" },
  { name: "Guitar", identifier: "fa-guitar" },
  { name: "Trống", identifier: "fa-drum" },
  { name: "Máy ảnh", identifier: "fa-camera" },
  { name: "Tai nghe", identifier: "fa-headphones" },
  { name: "Micro", identifier: "fa-microphone" },
  { name: "TV", identifier: "fa-tv" },

  // Gia đình & Xã hội
  { name: "Gia đình", identifier: "fa-users" },
  { name: "Tiệc tùng", identifier: "fa-glass-cheers" },
  { name: "Thú cưng", identifier: "fa-paw" },
  { name: "Mèo", identifier: "fa-cat" },
  { name: "Chó", identifier: "fa-dog" },
  { name: "Ngựa", identifier: "fa-horse" },
  { name: "Cá", identifier: "fa-fish" },
  { name: "Điện thoại", identifier: "fa-mobile-alt" },

  // Sở thích & Môi trường
  { name: "Cây cối", identifier: "fa-tree" },
  { name: "Trồng trọt", identifier: "fa-seedling" },
  { name: "Lá cây", identifier: "fa-leaf" },
  { name: "Vẽ", identifier: "fa-paint-brush" },
  { name: "Màu sắc", identifier: "fa-palette" },
  { name: "Quà", identifier: "fa-present" },

  // Tài chính & Ngân hàng
  { name: "Ví tiền", identifier: "fa-wallet" },
  { name: "Thẻ tín dụng", identifier: "fa-credit-card" },
  { name: "Ngân hàng", identifier: "fa-bank" },
  { name: "Hóa đơn chung", identifier: "fa-receipt" },
  { name: "Cân bằng", identifier: "fa-balance-scale" },

  // Thời tiết & Mùa
  { name: "Mặt trời", identifier: "fa-sun" },
  { name: "Mặt trăng", identifier: "fa-moon" },
  { name: "Mưa", identifier: "fa-cloud-rain" },
  { name: "Ô", identifier: "fa-umbrella" },
  { name: "Lửa", identifier: "fa-fire-alt" },
  { name: "Tuyết", identifier: "fa-snowflake" },

  // Công cụ & Kỹ thuật
  { name: "Cờ lê", identifier: "fa-wrench" },
  { name: "Búa", identifier: "fa-hammer" },
  { name: "Tuốc nơ vít", identifier: "fa-screwdriver" },
  { name: "Kéo", identifier: "fa-cut" },
  { name: "Bánh răng", identifier: "fa-cogs" },
  { name: "Chìa khóa", identifier: "fa-key" },
  { name: "Khóa", identifier: "fa-lock" },
  { name: "Khiên", identifier: "fa-shield" },

  // Khoa học
  { name: "Thí nghiệm", identifier: "fa-flask" },
  { name: "Vi khuẩn", identifier: "fa-microscope" },
  { name: "Nguyên tử", identifier: "fa-atom" },
  { name: "DNA", identifier: "fa-dna" },

  // Địa lý
  { name: "Vị trí", identifier: "fa-map-marker-alt" },
  { name: "Thế giới", identifier: "fa-globe-americas" },
  { name: "Cờ", identifier: "fa-flag" },

  // Tiện ích
  { name: "Thêm", identifier: "fa-plus-circle" },
  { name: "Bớt", identifier: "fa-minus-circle" },
];
