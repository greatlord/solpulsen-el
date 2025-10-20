-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 14, 2025 at 08:58 AM
-- Server version: 10.3.39-MariaDB-0ubuntu0.20.04.2
-- PHP Version: 8.4.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pulsen_suitecrm`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('Follow-up','Sales','Service','Support','Technical','Installation','Internal','Meeting Confirmed','Meeting Pending','Meeting Canceled') NOT NULL,
  `status` enum('Planned','In Progress','Completed','Delayed') NOT NULL,
  `priority` enum('Low','Medium','High') NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `created_date` date DEFAULT NULL,
  `estimated_hours` decimal(4,2) DEFAULT NULL,
  `completed_hours` decimal(4,2) DEFAULT NULL,
  `edited_by` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assignment_history`
--

CREATE TABLE `assignment_history` (
  `id` int(11) NOT NULL,
  `entity_type` enum('customer','activity','opportunity') NOT NULL,
  `entity_id` int(11) NOT NULL,
  `previous_user_id` int(11) DEFAULT NULL,
  `new_user_id` int(11) NOT NULL,
  `assigned_by` int(11) NOT NULL,
  `assignment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `assignment_history`
--

INSERT INTO `assignment_history` (`id`, `entity_type`, `entity_id`, `previous_user_id`, `new_user_id`, `assigned_by`, `assignment_date`, `notes`) VALUES
(3, 'customer', 16, 19, 13, 13, '2025-08-13 06:28:53', ''),
(4, 'customer', 34, 19, 13, 13, '2025-08-13 06:32:13', 'Detta är en företagare, möjligtvis vill de sälja sina tjänster'),
(5, 'customer', 38, 13, 13, 13, '2025-08-13 07:27:13', ''),
(6, 'customer', 44, 13, 15, 13, '2025-08-13 09:04:53', 'Testa honom, fick ej svar när jag ringde'),
(7, 'customer', 45, 13, 13, 13, '2025-08-13 11:53:44', ''),
(8, 'customer', 46, 13, 13, 13, '2025-08-13 12:09:40', ''),
(9, 'customer', 47, 13, 13, 13, '2025-08-13 12:26:46', '');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `customer_type` enum('Individual','Company') NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `organization_number` varchar(20) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `company_phone` varchar(20) DEFAULT NULL,
  `company_email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `address` text DEFAULT NULL,
  `customers_status` enum('Active','Potential','Closed','Paused') DEFAULT 'Potential',
  `source` enum('facebook','google','tips','fair','webpage','referral','existing_customer','linkedin','cold_contact') NOT NULL,
  `lead_status` enum('New','Contacted','In Discussion','Quote Sent','Hot Lead','Customer','Not Interested') DEFAULT NULL,
  `last_contact` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `rating` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `interest_areas` text DEFAULT NULL,
  `next_action` varchar(255) DEFAULT NULL,
  `battery_size` varchar(50) DEFAULT NULL,
  `heat_pump_type` varchar(50) DEFAULT NULL,
  `installation_address` text DEFAULT NULL,
  `assigned_to` int(11) NOT NULL,
  `assigned_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `customer_type`, `first_name`, `last_name`, `company_name`, `contact_person`, `organization_number`, `position`, `company_phone`, `company_email`, `phone`, `email`, `address`, `customers_status`, `source`, `lead_status`, `last_contact`, `rating`, `notes`, `interest_areas`, `next_action`, `battery_size`, `heat_pump_type`, `installation_address`, `assigned_to`, `assigned_date`, `created_by`, `created_at`, `updated_at`) VALUES
(4, 'Individual', 'Kicki', 'Gillbrand', NULL, '', '', '', '', '', '0730855449', 'kicki@gillbrand.se', 'Munkholmsvägen 2A, 197 40, sigtuna2', 'Potential', 'cold_contact', 'Quote Sent', '2025-08-13 12:30:11', 3, 'vill ej lägga solceller för de ska lägga nytt tak inom 10år och vill vänta. elförbrukning på ca 21kwh årligen. intresserad men vill läsa på innan hon bestämmer nått. återkoppling inom en vecka för mer info', '\"[\\\"Batterilager\\\",\\\"Energioptimering\\\"]\"', 'återkoppling', '15hwh', NULL, '-', 14, '2025-08-07 12:23:37', 14, '2025-08-07 13:23:37', '2025-08-13 12:30:11'),
(5, 'Individual', 'http://solpulsen.se/', 's', NULL, '', '', '', '', '', '4324', 'idg@idg.se', 'http://solpulsen.se/', 'Potential', 'facebook', 'New', '2025-08-07 13:29:45', 0, '', '[]', '', NULL, NULL, '', 18, '2025-08-07 12:29:45', 18, '2025-08-07 13:29:45', NULL),
(6, 'Individual', 'hkghfgfjhfjf', 'kghfjfd', NULL, '', '', '', '', '', '0730855449', 'kicki@gillbrand.se', 'munkholmsvägen 2A', 'Potential', 'facebook', 'New', '2025-08-07 13:38:43', 0, '', '\"[\\\"Batterilager\\\",\\\"Energioptimering\\\"]\"', '', NULL, NULL, '', 14, '2025-08-07 12:38:43', 14, '2025-08-07 13:38:43', NULL),
(13, 'Individual', 'Anna', 'Andersson', NULL, NULL, NULL, NULL, NULL, NULL, '0701234567', 'anna.andersson@email.com', '', 'Potential', 'facebook', 'New', '2025-08-11 12:06:59', NULL, 'Facebook Lead - Formulär-ID: 12345\nFormulärnamn: Solar Panel Interest Form\nSkapad från Facebook lead-formulär den 2025-08-11 12:06:59', '[\"Solceller\"]', NULL, NULL, NULL, NULL, 19, '2025-08-11 11:06:59', 19, '2025-08-11 12:06:59', NULL),
(38, 'Individual', 'Rolf', 'Atterling', NULL, '', '', '', '', '', '0705465456', 'rolf.atterling@hotmail.com', '', 'Potential', 'facebook', 'Quote Sent', '2025-08-13 12:27:47', 4, 'Rolf har en Huawei VX men är intreserad av att skaffa batteri med SolPulsen istället.', '\"[\\\"Batterilager\\\",\\\"Energioptimering\\\"]\"', 'Skicka info om produkter och datablad', NULL, NULL, '', 13, '2025-08-13 07:27:13', 13, '2025-08-13 08:27:02', '2025-08-13 12:27:47'),
(44, 'Individual', 'Erling', 'Christensen', NULL, '', '', '', '', '', '0705946797', 'fraga@mail.se', 'Notera att mail inte kom in, ring för var det ska mailas', 'Potential', 'facebook', 'New', '2025-08-13 10:04:53', 0, '', '[]', '', NULL, NULL, '', 15, '2025-08-13 09:04:53', 13, '2025-08-13 10:04:29', '2025-08-13 10:04:53');

-- --------------------------------------------------------

--
-- Table structure for table `opportunities`
--

CREATE TABLE `opportunities` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `value` decimal(15,2) NOT NULL,
  `probability` tinyint(4) DEFAULT NULL CHECK (`probability` >= 0 and `probability` <= 100),
  `stage` enum('prospect','qualification','negotiation','closed') NOT NULL,
  `expected_close_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `priority` enum('Low','Medium','High') NOT NULL,
  `source` enum('facebook','google','tips','fair','webpage','referral','existing_customer','linkedin','cold_contact') NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `edited_by` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `opportunities`
--

INSERT INTO `opportunities` (`id`, `customer_id`, `title`, `value`, `probability`, `stage`, `expected_close_date`, `description`, `notes`, `priority`, `source`, `tags`, `edited_by`, `created_by`, `created_at`) VALUES
(2, 38, 'Affärsmöjlighet - Rolf Atterling', 65000.00, 35, 'prospect', '2025-08-29', 'Konverterad från lead: Rolf Atterling', 'Rolf har en Huawei VX men är intreserad av att skaffa batteri med SolPulsen istället. Skickat offert på en 15kw batteri, kunden är rätt ljumen men intreserad av vårt koncept.', 'Medium', 'facebook', '\"facebook\"', 13, 13, '2025-08-13 12:29:14');

-- --------------------------------------------------------

--
-- Table structure for table `pause_periods`
--

CREATE TABLE `pause_periods` (
  `id` int(11) NOT NULL,
  `time_log_id` int(11) NOT NULL,
  `pause_start` timestamp NOT NULL DEFAULT current_timestamp(),
  `pause_end` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `time_logs`
--

CREATE TABLE `time_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `project_name` varchar(255) NOT NULL,
  `start_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `description` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `time_logs`
--

INSERT INTO `time_logs` (`id`, `user_id`, `project_name`, `start_time`, `end_time`, `status`, `description`, `updated_at`, `created_at`) VALUES
(7, 6, 'Default Project', '2025-08-07 12:15:19', '2025-08-07 12:21:52', 'pending', 'Working...', '2025-08-07 12:21:52', '2025-08-07 12:15:19'),
(8, 6, 'Default Project', '2025-08-11 21:59:13', '2025-08-11 21:59:15', 'pending', 'Working...', '2025-08-11 21:59:15', '2025-08-11 21:59:13'),
(9, 6, 'Default Project', '2025-08-12 18:18:28', '2025-08-12 18:18:28', 'pending', 'Working...', '2025-08-12 18:18:28', '2025-08-12 18:18:28');

-- --------------------------------------------------------

--
-- Table structure for table `time_tracking`
--

CREATE TABLE `time_tracking` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `pause_minutes` int(11) NOT NULL,
  `total_hours` decimal(4,2) NOT NULL,
  `project` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` text NOT NULL,
  `role` enum('säljare','säljchef','admin') DEFAULT 'säljare',
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `first_name`, `last_name`, `phone`, `is_active`, `created_at`, `last_login`) VALUES
(6, 'admin@solpulsen.com', 'admin@solpulsen.com', '$2y$12$/V1YSjXhGitEX0ayBu91ze/.enilsjM/lYRTmWAQIwe.by7gmflJG', 'säljchef', 'Mag2regerfdgerger', 'ols2gergreerger', '24343regergererge', 1, '2025-07-22 08:13:41', '2025-08-13 15:42:22'),
(13, 'dino@solpulsen.se', 'dino@solpulsen.se', '$2y$10$.Or0aW1tpftIlNc/cguej.VJ/a2NYhYQOVMo0qjvKc.fgTyrEPu9a', 'säljchef', 'Dino', 'S', 'crmMasterAdmin', 1, '2025-08-01 15:45:35', '2025-08-14 07:58:53'),
(14, 'linus@solpulsen.se', 'linus@solpulsen.se', '$2y$12$J/9v83M7I7sMttoJ9MdCKuCwzFizFR4OJHlXAjnCVcLB0kxuqiu9K', 'säljare', 'Linus', 'Meadows', '+46737208963', 1, '2025-08-01 15:47:28', '2025-08-11 10:42:32'),
(15, 'tommy@solpulsen.se', 'tommy@solpulsen.se', '$2y$10$vzl5tI5HXaSlb/qG3Mc9vOAQThlGMhAPrwonGuTmATuCQkRnjRUD6', 'säljare', 'Tommy', 'Gustavsson', 'crmMasterAdmin', 1, '2025-08-01 15:49:18', '2025-08-07 15:03:24'),
(16, 'robin@solpulsen.se', 'robin@solpulsen.se', '$2y$10$VUzqvrWCOP.HZ9FW8sraAeLftC1nW3lr96i.RwvRRTvOzqUbe0xde', 'säljare', 'Robin', '?', NULL, 1, '2025-08-01 15:50:15', '2025-08-07 15:03:42'),
(17, 'amy@solpulsen.se', 'amy@solpulsen.se', '$2y$10$5As9KrhFRjpnheqqxkOIWO5JINrc89JWobnzNZJzkOv7kgUjyyIU2', 'säljare', 'Amy', '?', 'crmMasterAdmin', 1, '2025-08-01 15:51:21', '2025-08-07 15:04:06'),
(18, 'test@solpulsen.se', 'test@solpulsen.se', '$2y$12$/V1YSjXhGitEX0ayBu91ze/.enilsjM/lYRTmWAQIwe.by7gmflJG', 'säljare', 'Test', 'Demo', 'crmMasterAdmin', 1, '2025-08-03 08:53:17', '2025-08-07 14:29:13'),
(19, '', 'Facebook@solpulsen.se', '$2y$10$KjyOvTZV/PZqzArFND8f0.zbIaUTgub5w7nT.VsUgF6u/ChoWQnMy', 'säljare', 'Facebook', 'facebook', 'crmMasterAdmin', 1, '2025-08-08 10:07:27', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `assignment_history`
--
ALTER TABLE `assignment_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `entity_idx` (`entity_type`,`entity_id`),
  ADD KEY `user_idx` (`new_user_id`),
  ADD KEY `date_idx` (`assignment_date`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `opportunities`
--
ALTER TABLE `opportunities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pause_periods`
--
ALTER TABLE `pause_periods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `time_log_id` (`time_log_id`);

--
-- Indexes for table `time_logs`
--
ALTER TABLE `time_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `time_tracking`
--
ALTER TABLE `time_tracking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `date_idx` (`date`),
  ADD KEY `project_idx` (`project`),
  ADD KEY `status_idx` (`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `assignment_history`
--
ALTER TABLE `assignment_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `opportunities`
--
ALTER TABLE `opportunities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pause_periods`
--
ALTER TABLE `pause_periods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `time_logs`
--
ALTER TABLE `time_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `time_tracking`
--
ALTER TABLE `time_tracking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `time_logs`
--
ALTER TABLE `time_logs`
  ADD CONSTRAINT `time_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `time_tracking`
--
ALTER TABLE `time_tracking`
  ADD CONSTRAINT `time_tracking_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
