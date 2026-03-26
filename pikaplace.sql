-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 26, 2026 at 07:54 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pikaplace`
--

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `status` varchar(16) NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 'active', '2026-03-26 05:46:36', '2026-03-26 05:46:36');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` bigint(20) NOT NULL,
  `cart_id` bigint(20) NOT NULL,
  `product_id` bigint(20) NOT NULL,
  `quantity` int(11) NOT NULL,
  `added_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `cart_id`, `product_id`, `quantity`, `added_at`, `updated_at`) VALUES
(1, 1, 2, 1, '2026-03-26 06:42:08', '2026-03-26 06:42:08');

-- --------------------------------------------------------

--
-- Table structure for table `login_events`
--

CREATE TABLE `login_events` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_events`
--

INSERT INTO `login_events` (`id`, `user_id`, `at`) VALUES
(1, 1, '2026-03-25 13:51:22'),
(2, 1, '2026-03-26 05:44:54'),
(3, 2, '2026-03-26 05:46:35'),
(4, 1, '2026-03-26 06:43:07');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `paypal_order_id` varchar(64) DEFAULT NULL,
  `paypal_capture_id` varchar(64) DEFAULT NULL,
  `status` varchar(16) NOT NULL DEFAULT 'pending',
  `currency` varchar(8) NOT NULL DEFAULT 'USD',
  `subtotal` decimal(12,2) NOT NULL,
  `tax` decimal(12,2) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `shipping_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`shipping_json`)),
  `customer_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`customer_json`)),
  `address_text` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `paypal_order_id`, `paypal_capture_id`, `status`, `currency`, `subtotal`, `tax`, `total`, `shipping_json`, `customer_json`, `address_text`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, NULL, 'pending', 'USD', 4499.00, 449.90, 4948.90, '{\"addressLine\": \"C-265,ADISHWARNAGAR SOCITY,NARODA,I\", \"state\": \"Gujarat\", \"city\": \"AHMEDABAD\", \"pin\": \"382330\"}', '{\"fullName\": \"vishw\", \"mobile\": \"8200739265\", \"email\": \"bhavesh5611patel@gmail.com\"}', 'C-265,ADISHWARNAGAR SOCITY,NARODA,I, AHMEDABAD, Gujarat, PIN 382330', '2026-03-26 06:11:10', '2026-03-26 06:11:10'),
(2, 2, NULL, NULL, 'pending', 'USD', 4499.00, 449.90, 4948.90, '{\"addressLine\": \"C-265,ADISHWARNAGAR SOCITY,NARODA,I\", \"state\": \"Gujarat\", \"city\": \"AHMEDABAD\", \"pin\": \"382330\"}', '{\"fullName\": \"vishw\", \"mobile\": \"8200739265\", \"email\": \"bhavesh5611patel@gmail.com\"}', 'C-265,ADISHWARNAGAR SOCITY,NARODA,I, AHMEDABAD, Gujarat, PIN 382330', '2026-03-26 06:11:20', '2026-03-26 06:11:20'),
(3, 2, NULL, NULL, 'pending', 'USD', 4499.00, 449.90, 4948.90, '{\"addressLine\": \"C-265,ADISHWARNAGAR SOCITY,NARODA,I\", \"state\": \"Gujarat\", \"city\": \"AHMEDABAD\", \"pin\": \"382330\"}', '{\"fullName\": \"vishw\", \"mobile\": \"8200739265\", \"email\": \"bhavesh5611patel@gmail.com\"}', 'C-265,ADISHWARNAGAR SOCITY,NARODA,I, AHMEDABAD, Gujarat, PIN 382330', '2026-03-26 06:11:29', '2026-03-26 06:11:29'),
(4, 2, NULL, NULL, 'pending', 'USD', 4499.00, 449.90, 4948.90, '{\"addressLine\": \"C-265,ADISHWARNAGAR SOCITY,NARODA,I\", \"state\": \"Gujarat\", \"city\": \"AHMEDABAD\", \"pin\": \"382330\"}', '{\"fullName\": \"vishw b patel\", \"mobile\": \"1820073926\", \"email\": \"patelvishw@gmail.com\"}', 'C-265,ADISHWARNAGAR SOCITY,NARODA,I, AHMEDABAD, Gujarat, PIN 382330', '2026-03-26 06:25:13', '2026-03-26 06:25:13'),
(5, 2, NULL, NULL, 'pending', 'USD', 4499.00, 449.90, 4948.90, '{\"addressLine\": \"C-265,ADISHWARNAGAR SOCITY,NARODA,I\", \"state\": \"Gujarat\", \"city\": \"AHMEDABAD\", \"pin\": \"382330\"}', '{\"fullName\": \"vishw b patel\", \"mobile\": \"1820073926\", \"email\": \"patelvishw@gmail.com\"}', 'C-265,ADISHWARNAGAR SOCITY,NARODA,I, AHMEDABAD, Gujarat, PIN 382330', '2026-03-26 06:29:30', '2026-03-26 06:29:30'),
(6, 2, NULL, NULL, 'pending', 'USD', 4499.00, 449.90, 4948.90, '{\"addressLine\": \"C-265,ADISHWARNAGAR SOCITY,NARODA,I\", \"state\": \"Gujarat\", \"city\": \"AHMEDABAD\", \"pin\": \"382330\"}', '{\"fullName\": \"vishw b patel\", \"mobile\": \"1820073926\", \"email\": \"patelvishw@gmail.com\"}', 'C-265,ADISHWARNAGAR SOCITY,NARODA,I, AHMEDABAD, Gujarat, PIN 382330', '2026-03-26 06:29:36', '2026-03-26 06:29:36');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) NOT NULL,
  `order_id` bigint(20) NOT NULL,
  `product_id` bigint(20) DEFAULT NULL,
  `product_name_snapshot` varchar(200) NOT NULL,
  `unit_price_snapshot` decimal(12,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `unit_price_snapshot`, `quantity`, `amount`) VALUES
(1, 1, 2, 'Noir Heritage Leather', 4499.00, 1, 4499.00),
(2, 2, 2, 'Noir Heritage Leather', 4499.00, 1, 4499.00),
(3, 3, 2, 'Noir Heritage Leather', 4499.00, 1, 4499.00),
(4, 4, 2, 'Noir Heritage Leather', 4499.00, 1, 4499.00),
(5, 5, 2, 'Noir Heritage Leather', 4499.00, 1, 4499.00),
(6, 6, 2, 'Noir Heritage Leather', 4499.00, 1, 4499.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) NOT NULL,
  `category` varchar(100) NOT NULL,
  `name` varchar(200) NOT NULL,
  `specs` text DEFAULT NULL,
  `price_value` decimal(12,2) NOT NULL,
  `image_url` text DEFAULT NULL,
  `images_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images_json`)),
  `available` int(11) NOT NULL DEFAULT 0,
  `reorder_at` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category`, `name`, `specs`, `price_value`, `image_url`, `images_json`, `available`, `reorder_at`, `created_at`, `updated_at`) VALUES
(1, 'Luxury Classic', 'Aurelius Classic Gold', 'Automatic · Sapphire Glass · 5 ATM', 11999.00, 'https://images.unsplash.com/photo-1548171916-30c7c511c1e9?auto=format&fit=crop&w=1200&q=80', 'null', 42, 10, '2026-03-25 10:36:20', '2026-03-25 16:47:26'),
(2, 'Everyday Casual', 'Noir Heritage Leather', 'Quartz · Italian Leather · 3 ATM', 4499.00, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80', 'null', 28, 8, '2026-03-25 10:36:20', '2026-03-25 10:36:20'),
(3, 'Formal Dress', 'Ivory Dial Heritage', 'Slim Case · Date Window · 3 ATM', 3999.00, 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80', 'null', 15, 5, '2026-03-25 10:36:20', '2026-03-25 10:36:20'),
(4, 'Sport Chrono', 'Midnight Steel Chrono', 'Chronograph · Tachymeter · 10 ATM', 5499.00, 'https://images.unsplash.com/photo-1524592714635-79fdaec1c1c1?auto=format&fit=crop&w=1200&q=80', 'null', 9, 6, '2026-03-25 10:36:20', '2026-03-25 10:36:20'),
(5, 'Luxury Classic', 'Regal Silver Date', 'Automatic · Steel Bracelet · 5 ATM', 5499.00, 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80', 'null', 42, 10, '2026-03-25 10:36:20', '2026-03-25 10:36:20'),
(6, 'Everyday Casual', 'Navy Minimal Date', 'Quartz · Canvas Strap · 3 ATM', 3499.00, 'https://images.unsplash.com/photo-1524594154908-edd35596e0df?auto=format&fit=crop&w=1200&q=80', 'null', 28, 8, '2026-03-25 10:36:20', '2026-03-25 10:36:20');

-- --------------------------------------------------------

--
-- Table structure for table `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `product_id` bigint(20) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `site_content`
--

CREATE TABLE `site_content` (
  `id` bigint(20) NOT NULL,
  `content_key` varchar(200) NOT NULL,
  `content_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`content_json`)),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `site_content`
--

INSERT INTO `site_content` (`id`, `content_key`, `content_json`, `updated_at`) VALUES
(1, 'home_hero', '{\"tag\": \"New arrivals \\u00b7 2026 collection\", \"titleMain\": \"Timeless Watches for\", \"titleHighlight\": \"Timeless Style\", \"subtitle\": \"Premium analog watches crafted for elegance and precision. Discover hand-finished pieces that celebrate classic horology with a contemporary edge.\", \"watchName\": \"Midnight Steel Chrono\", \"watchSub\": \"Limited edition \\u00b7 250 pieces\", \"priceText\": \"\\u20b95,999\", \"imageUrl\": \"https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:500/height:500/https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/1-rKSrImqDhRJv01tqjmn.png@jpg\"}', '2026-03-25 13:53:35'),
(2, 'home_collections', '[{\"id\": \"luxury\", \"title\": \"Luxury Watches\", \"story\": \"Hand-finished pieces with precious metals and sapphire glass.\", \"image\": \"https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:500/https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/ydLC5vD0zu2exNPmIFHdn.png\"}, {\"id\": \"sports\", \"title\": \"Sports Watches\", \"story\": \"Rugged chronographs built for performance and precision.\", \"image\": \"https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:500/https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/aeqO41N8Ug7-_T3N1FM2A.png\"}, {\"id\": \"casual\", \"title\": \"Casual Watches\", \"story\": \"Minimal everyday designs that pair with anything.\", \"image\": \"https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/kpiokBniZGz2LscKaJdA-.png\"}, {\"id\": \"formal\", \"title\": \"Formal Watches\", \"story\": \"Slim, elegant dress watches for black-tie occasions.\", \"image\": \"https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80\"}]', '2026-03-25 13:51:34'),
(3, 'about_content', '{\"heroPill\": \"About PIKAPLACE\", \"heroTitleMain\": \"Timeless watches, crafted\", \"heroTitleHighlight\": \" for every moment.\", \"heroSubtitle\": \"At PIKAPLACE, we blend classic watchmaking heritage with modern design. Every piece is curated to feel special on your wrist \\u2013 whether it\'s your first interview, a weekend escape, or a once-in-a-lifetime celebration.\", \"stat1Number\": \"50+\", \"stat1Label\": \"Curated designs\", \"stat2Number\": \"4.8\\u2605\", \"stat2Label\": \"Average rating\", \"stat3Number\": \"24/7\", \"stat3Label\": \"Support\", \"heroMainImage\": \"https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:500/height:500/https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/1-rKSrImqDhRJv01tqjmn.png@jpg\", \"heroCard1Image\": \"https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80\", \"heroCard2Image\": \"https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/kpiokBniZGz2LscKaJdA-.png\", \"heroCard1Tag\": \"Signature Collection\", \"heroCard1Text\": \"Minimal dials, rich textures, and premium finishes built to outlast trends.\", \"heroCard2Tag\": \"Crafted for India\", \"heroCard2Text\": \"Comfort-focused straps, durable cases, and water resistance for everyday life.\", \"storyImage\": \"https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80\", \"storyTitle\": \"Our story\", \"storyBody1\": \"PIKAPLACE started with a simple idea: great watches shouldn\'t feel out of reach. We were tired of choosing between unreliable budget pieces and overpriced luxury. So we set out to build a curated collection that delivers both character and quality.\", \"storyBody2\": \"Today, we partner with trusted manufacturers and designers to bring you watches that balance precision engineering with timeless aesthetics.\", \"craftImage\": \"https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/kpiokBniZGz2LscKaJdA-.png\", \"craftTitle\": \"Craft & quality\", \"craftList\": \"Stainless steel or premium alloy cases for lasting durability.\\nComfort-first straps: leather, steel, and sport-ready bands.\\nThoughtful details like sapphire / mineral glass and date windows.\\nCurated collections for classic, casual, dress, and sport styles.\", \"promiseTitle\": \"Our promise\", \"promiseText\": \"We keep our experience simple: transparent pricing, clear information, and responsive support. If something doesn\'t feel right with your order, our team is ready to help you make it right.\", \"helpTitle\": \"Need help?\", \"helpIntro\": \"Have a question about sizing, straps, or picking the right watch for a special occasion? Reach out to us:\", \"helpEmail\": \"support@pikaplace.in\", \"helpPhone\": \"+91-98765-43210\", \"helpHours\": \"Mon \\u2013 Sat, 10am to 7pm IST\"}', '2026-03-25 13:51:34'),
(4, 'about_blogs', '[{\"id\": \"story\", \"title\": \"Our story\", \"story\": \"PIKAPLACE started with a simple idea: great watches shouldn\'t feel out of reach. We were tired of choosing between unreliable budget pieces and overpriced luxury. So we set out to build a curated collection that delivers both character and quality. Today, we partner with trusted manufacturers and designers to bring you watches that balance precision engineering with timeless aesthetics.\", \"image\": \"https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80\"}, {\"id\": \"craft\", \"title\": \"Craft & quality\", \"story\": \"Stainless steel or premium alloy cases for lasting durability. Comfort-first straps: leather, steel, and sport-ready bands. Thoughtful details like sapphire/mineral glass and date windows. Curated collections for classic, casual, dress, and sport styles.\", \"image\": \"https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/kpiokBniZGz2LscKaJdA-.png\"}, {\"id\": \"promise\", \"title\": \"Our promise\", \"story\": \"We keep our experience simple: transparent pricing, clear information, and responsive support. If something doesn\'t feel right with your order, our team is ready to help you make it right.\", \"image\": \"\"}, {\"id\": \"help\", \"title\": \"Need help?\", \"story\": \"Email: support@pikaplace.in | Phone/WhatsApp: +91-98765-43210 | Hours: Mon-Sat, 10am-7pm IST\", \"image\": \"\"}]', '2026-03-25 13:51:34');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `firebase_uid` varchar(128) NOT NULL,
  `phone_number` varchar(32) NOT NULL,
  `name` varchar(120) DEFAULT NULL,
  `role` varchar(16) NOT NULL DEFAULT 'customer',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firebase_uid`, `phone_number`, `name`, `role`, `created_at`, `updated_at`) VALUES
(1, 'wlzZGxojzJTMF7kV51arKF1ATBd2', '+918200739265', NULL, 'admin', '2026-03-25 13:51:22', '2026-03-25 13:51:22'),
(2, 'LdjXnQb4g5PYnAIpuM97CoEwIV42', '+917874501677', NULL, 'customer', '2026-03-26 05:46:35', '2026-03-26 05:46:35');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_carts_user` (`user_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_cart_item_product` (`cart_id`,`product_id`),
  ADD KEY `fk_cart_items_product` (`product_id`);

--
-- Indexes for table `login_events`
--
ALTER TABLE `login_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_login_events_user` (`user_id`),
  ADD KEY `idx_login_events_at` (`at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `paypal_order_id` (`paypal_order_id`),
  ADD KEY `idx_orders_user` (`user_id`),
  ADD KEY `idx_orders_status` (`status`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_items_order` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_category` (`category`),
  ADD KEY `idx_products_available` (`available`);

--
-- Indexes for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_review_user_product` (`user_id`,`product_id`),
  ADD KEY `fk_product_reviews_product` (`product_id`);

--
-- Indexes for table `site_content`
--
ALTER TABLE `site_content`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `content_key` (`content_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `firebase_uid` (`firebase_uid`),
  ADD UNIQUE KEY `phone_number` (`phone_number`),
  ADD KEY `idx_users_firebase_uid` (`firebase_uid`),
  ADD KEY `idx_users_phone_number` (`phone_number`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `login_events`
--
ALTER TABLE `login_events`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `site_content`
--
ALTER TABLE `site_content`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`),
  ADD CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `login_events`
--
ALTER TABLE `login_events`
  ADD CONSTRAINT `fk_login_events_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Constraints for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `fk_product_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_product_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
