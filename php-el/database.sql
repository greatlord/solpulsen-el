-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 20, 2025 at 02:45 PM
-- Server version: 10.3.39-MariaDB-0ubuntu0.20.04.2
-- PHP Version: 8.4.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pulsen_el`
--

-- --------------------------------------------------------

--
-- Table structure for table `inspection_photos`
--

CREATE TABLE `inspection_photos` (
  `id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `photo` longblob DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inspection_sections`
--

CREATE TABLE `inspection_sections` (
  `id` int(11) NOT NULL,
  `inspection_id` int(11) NOT NULL,
  `section_number` int(11) NOT NULL,
  `section_name` varchar(255) DEFAULT NULL,
  `work_permit_obtained` tinyint(1) DEFAULT NULL,
  `safety_equipment_checked` tinyint(1) DEFAULT NULL,
  `voltage_testers_calibrated` tinyint(1) DEFAULT NULL,
  `isolation_testers_available` tinyint(1) DEFAULT NULL,
  `personal_protective_equipment` tinyint(1) DEFAULT NULL,
  `cable_size_correct` tinyint(1) DEFAULT NULL,
  `cable_routing_safe` tinyint(1) DEFAULT NULL,
  `cable_protection_installed` tinyint(1) DEFAULT NULL,
  `cable_marking_complete` tinyint(1) DEFAULT NULL,
  `fire_seals_installed` tinyint(1) DEFAULT NULL,
  `inverter_mounting_secure` tinyint(1) DEFAULT NULL,
  `inverter_ventilation_adequate` tinyint(1) DEFAULT NULL,
  `dc_connections_correct` tinyint(1) DEFAULT NULL,
  `ac_connections_correct` tinyint(1) DEFAULT NULL,
  `grounding_verified` tinyint(1) DEFAULT NULL,
  `inverter_configured` tinyint(1) DEFAULT NULL,
  `circuit_breaker_size_correct` tinyint(1) DEFAULT NULL,
  `rcbo_installed` tinyint(1) DEFAULT NULL,
  `labeling_complete` tinyint(1) DEFAULT NULL,
  `connections_tightened` tinyint(1) DEFAULT NULL,
  `phases_balanced` tinyint(1) DEFAULT NULL,
  `earthing_resistance_measured` tinyint(1) DEFAULT NULL,
  `earthing_resistance_acceptable` tinyint(1) DEFAULT NULL,
  `surge_protection_installed` tinyint(1) DEFAULT NULL,
  `bonding_conductors_installed` tinyint(1) DEFAULT NULL,
  `lightning_protection_connected` tinyint(1) DEFAULT NULL,
  `insulation_resistance_test` tinyint(1) DEFAULT NULL,
  `continuity_test` tinyint(1) DEFAULT NULL,
  `polarity_test` tinyint(1) DEFAULT NULL,
  `rcd_test` tinyint(1) DEFAULT NULL,
  `voltage_test` tinyint(1) DEFAULT NULL,
  `functional_test` tinyint(1) DEFAULT NULL,
  `schematic_diagrams_complete` tinyint(1) DEFAULT NULL,
  `installation_certificate_issued` tinyint(1) DEFAULT NULL,
  `test_results_documented` tinyint(1) DEFAULT NULL,
  `user_manual_provided` tinyint(1) DEFAULT NULL,
  `warranty_documents_provided` tinyint(1) DEFAULT NULL,
  `system_started_successfully` tinyint(1) DEFAULT NULL,
  `monitoring_system_connected` tinyint(1) DEFAULT NULL,
  `customer_instructed` tinyint(1) DEFAULT NULL,
  `site_cleaned_up` tinyint(1) DEFAULT NULL,
  `final_inspection_complete` tinyint(1) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inspection_signatures`
--

CREATE TABLE `inspection_signatures` (
  `id` int(11) NOT NULL,
  `inspection_id` int(11) NOT NULL,
  `type` enum('electrician','customer') DEFAULT NULL,
  `signature_text` varchar(100) DEFAULT NULL,
  `signature_image` longblob DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `installations`
--

CREATE TABLE `installations` (
  `id` int(11) NOT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `project_number` varchar(100) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `installer_name` varchar(255) DEFAULT NULL,
  `supervisor` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `installation_photos`
--

CREATE TABLE `installation_photos` (
  `id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `photo` longblob DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `installation_sections`
--

CREATE TABLE `installation_sections` (
  `id` int(11) NOT NULL,
  `installation_id` int(11) NOT NULL,
  `section_number` int(11) NOT NULL,
  `section_name` varchar(255) DEFAULT NULL,
  `roof_inspected` tinyint(1) DEFAULT NULL,
  `fixings_checked` tinyint(1) DEFAULT NULL,
  `weather_checked` tinyint(1) DEFAULT NULL,
  `tools_inspected` tinyint(1) DEFAULT NULL,
  `safety_used` tinyint(1) DEFAULT NULL,
  `rails_aligned` tinyint(1) DEFAULT NULL,
  `fixings_load_bearing` tinyint(1) DEFAULT NULL,
  `sealings_installed` tinyint(1) DEFAULT NULL,
  `bolts_tightened` tinyint(1) DEFAULT NULL,
  `panels_fixed` tinyint(1) DEFAULT NULL,
  `even_alignment` tinyint(1) DEFAULT NULL,
  `no_damaged_cables` tinyint(1) DEFAULT NULL,
  `serial_numbers_documented` tinyint(1) DEFAULT NULL,
  `cables_sized` tinyint(1) DEFAULT NULL,
  `mc4_crimped` tinyint(1) DEFAULT NULL,
  `dc_isolator_installed` tinyint(1) DEFAULT NULL,
  `cable_paths_protected` tinyint(1) DEFAULT NULL,
  `weather_checked_section5` tinyint(1) DEFAULT NULL,
  `work_paused_wind` tinyint(1) DEFAULT NULL,
  `ppe_used` tinyint(1) DEFAULT NULL,
  `all_panels_fixed` tinyint(1) DEFAULT NULL,
  `all_cables_marked` tinyint(1) DEFAULT NULL,
  `roof_sealed` tinyint(1) DEFAULT NULL,
  `area_cleaned` tinyint(1) DEFAULT NULL,
  `documentation_handed_over` tinyint(1) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `installation_signatures`
--

CREATE TABLE `installation_signatures` (
  `id` int(11) NOT NULL,
  `installation_id` int(11) NOT NULL,
  `type` enum('installer','supervisor') DEFAULT NULL,
  `signature_text` varchar(100) DEFAULT NULL,
  `signature_image` longblob DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Table structure for table `project_inspections`
--

CREATE TABLE `project_inspections` (
  `id` int(11) NOT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `project_number` varchar(100) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `electrician_name` varchar(255) DEFAULT NULL,
  `certification_number` varchar(100) DEFAULT NULL,
  `electrician_signature` longblob DEFAULT NULL,
  `customer_signature` longblob DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('säljare','säljchef','admin') DEFAULT 'säljare',
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `inspection_photos`
--
ALTER TABLE `inspection_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `section_id` (`section_id`);

--
-- Indexes for table `inspection_sections`
--
ALTER TABLE `inspection_sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inspection_id` (`inspection_id`);

--
-- Indexes for table `inspection_signatures`
--
ALTER TABLE `inspection_signatures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inspection_id` (`inspection_id`);

--
-- Indexes for table `installations`
--
ALTER TABLE `installations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `installation_photos`
--
ALTER TABLE `installation_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `section_id` (`section_id`);

--
-- Indexes for table `installation_sections`
--
ALTER TABLE `installation_sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `installation_id` (`installation_id`);

--
-- Indexes for table `installation_signatures`
--
ALTER TABLE `installation_signatures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `installation_id` (`installation_id`);

--
-- Indexes for table `pause_periods`
--
ALTER TABLE `pause_periods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `time_log_id` (`time_log_id`);

--
-- Indexes for table `project_inspections`
--
ALTER TABLE `project_inspections`
  ADD PRIMARY KEY (`id`);

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
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `inspection_photos`
--
ALTER TABLE `inspection_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inspection_sections`
--
ALTER TABLE `inspection_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inspection_signatures`
--
ALTER TABLE `inspection_signatures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `installations`
--
ALTER TABLE `installations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `installation_photos`
--
ALTER TABLE `installation_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `installation_sections`
--
ALTER TABLE `installation_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `installation_signatures`
--
ALTER TABLE `installation_signatures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pause_periods`
--
ALTER TABLE `pause_periods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_inspections`
--
ALTER TABLE `project_inspections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `time_logs`
--
ALTER TABLE `time_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `time_tracking`
--
ALTER TABLE `time_tracking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `inspection_photos`
--
ALTER TABLE `inspection_photos`
  ADD CONSTRAINT `inspection_photos_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `inspection_sections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inspection_sections`
--
ALTER TABLE `inspection_sections`
  ADD CONSTRAINT `inspection_sections_ibfk_1` FOREIGN KEY (`inspection_id`) REFERENCES `project_inspections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inspection_signatures`
--
ALTER TABLE `inspection_signatures`
  ADD CONSTRAINT `inspection_signatures_ibfk_1` FOREIGN KEY (`inspection_id`) REFERENCES `project_inspections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `installation_photos`
--
ALTER TABLE `installation_photos`
  ADD CONSTRAINT `installation_photos_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `installation_sections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `installation_sections`
--
ALTER TABLE `installation_sections`
  ADD CONSTRAINT `installation_sections_ibfk_1` FOREIGN KEY (`installation_id`) REFERENCES `installations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `installation_signatures`
--
ALTER TABLE `installation_signatures`
  ADD CONSTRAINT `installation_signatures_ibfk_1` FOREIGN KEY (`installation_id`) REFERENCES `installations` (`id`) ON DELETE CASCADE;

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
