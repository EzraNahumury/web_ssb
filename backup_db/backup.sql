-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 30, 2026 at 10:26 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ayres_ssb_dashboard`
--

-- --------------------------------------------------------

--
-- Table structure for table `age_groups`
--

CREATE TABLE `age_groups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ssb_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `min_age` int(10) UNSIGNED NOT NULL,
  `max_age` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `age_groups`
--

INSERT INTO `age_groups` (`id`, `ssb_id`, `name`, `min_age`, `max_age`, `created_at`, `updated_at`) VALUES
(6, 8, 'U-7', 5, 7, '2026-03-28 07:16:14', '2026-03-28 07:16:14'),
(7, 8, 'U-17', 7, 17, '2026-03-28 07:16:31', '2026-03-28 07:16:36'),
(8, 8, 'Senior', 17, 30, '2026-03-28 07:16:54', '2026-03-28 07:16:54');

-- --------------------------------------------------------

--
-- Table structure for table `participants`
--

CREATE TABLE `participants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ssb_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `nickname` varchar(100) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `jersey_size` varchar(10) DEFAULT NULL,
  `age_group` varchar(50) DEFAULT NULL,
  `tournament` varchar(200) DEFAULT NULL,
  `parent_name` varchar(150) DEFAULT NULL,
  `parent_phone` varchar(30) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `join_date` date DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `participants`
--

INSERT INTO `participants` (`id`, `ssb_id`, `name`, `nickname`, `photo`, `birth_date`, `position`, `role`, `jersey_size`, `age_group`, `tournament`, `parent_name`, `parent_phone`, `address`, `join_date`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(11, 8, 'RONALDO NAHUMURY', 'R7', '/uploads/participants/496a9e8f-d361-499f-b54c-d4d5b22db35c.jpg', '2015-10-28', 'Forward', 'CF', 'Dewasa S', 'U-17', 'BRI LIGA 1', 'HANY', '0823312211', 'JEMBATAN MERAH , GEJAYAN, SLEMAN', '2026-03-27', 'ACTIVE', NULL, '2026-03-28 07:18:50', '2026-03-30 08:18:30'),
(12, 8, 'EZRA KRISTANTO NAHUMURY', 'EZ', '/uploads/participants/d68e7806-6a13-4d65-a1e2-bb50e2ad0c7c.jpg', '2004-08-23', 'Midfielder', 'CM, AM, RWB', 'Dewasa XXL', 'Senior', 'PRESIDEN CUP 2026, BRI LIGA 1', 'KRIS', '085335334466', 'BANGUNTAPAN, BANTUL', '2026-03-28', 'ACTIVE', NULL, '2026-03-28 07:20:22', '2026-03-30 08:18:36');

-- --------------------------------------------------------

--
-- Table structure for table `partnerships`
--

CREATE TABLE `partnerships` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ssb_id` bigint(20) UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('ACTIVE','INACTIVE','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `partnerships`
--

INSERT INTO `partnerships` (`id`, `ssb_id`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(8, 8, '2026-03-28', '2027-03-28', 'ACTIVE', '2026-03-28 07:10:54', '2026-03-28 07:10:54');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ssb_id` bigint(20) UNSIGNED NOT NULL,
  `participant_id` bigint(20) UNSIGNED NOT NULL,
  `payment_type` enum('MONTHLY','REGISTRATION','SESSION') NOT NULL,
  `amount` decimal(12,0) UNSIGNED NOT NULL,
  `period_month` char(7) DEFAULT NULL,
  `status` enum('UNPAID','PAID') NOT NULL DEFAULT 'UNPAID',
  `paid_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `ssb_id`, `participant_id`, `payment_type`, `amount`, `period_month`, `status`, `paid_at`, `notes`, `created_at`, `updated_at`) VALUES
(16, 8, 11, 'REGISTRATION', 500000, NULL, 'PAID', '2026-03-28 07:26:56', NULL, '2026-03-28 07:26:01', '2026-03-28 07:26:56'),
(17, 8, 12, 'REGISTRATION', 500000, NULL, 'UNPAID', NULL, NULL, '2026-03-28 07:26:01', '2026-03-28 07:26:01'),
(19, 8, 11, 'MONTHLY', 250000, '2026-03', 'UNPAID', NULL, NULL, '2026-03-28 07:26:17', '2026-03-28 07:26:17'),
(20, 8, 12, 'MONTHLY', 250000, '2026-03', 'PAID', '2026-03-28 07:26:36', NULL, '2026-03-28 07:26:17', '2026-03-28 07:26:36'),
(22, 8, 11, 'MONTHLY', 250000, '2026-04', 'UNPAID', NULL, NULL, '2026-03-28 07:26:39', '2026-03-28 07:26:39'),
(23, 8, 12, 'MONTHLY', 250000, '2026-04', 'UNPAID', NULL, NULL, '2026-03-28 07:26:39', '2026-03-28 07:26:39');

-- --------------------------------------------------------

--
-- Table structure for table `ssb`
--

CREATE TABLE `ssb` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `partnership_notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ssb`
--

INSERT INTO `ssb` (`id`, `name`, `logo`, `address`, `phone`, `created_at`, `updated_at`, `partnership_notes`) VALUES
(8, 'Sashastra Seema Bal', '/uploads/ssb/658ed92b-5ca6-4217-8384-b81e196f27a3.png', 'Jl. Raya Pemuda No. 123, Kelurahan Mekarsari, Kecamatan Cimanggis, Kota Depok, Jawa Barat 16452', '081234567890', '2026-03-28 07:10:54', '2026-03-28 07:10:54', 'SSB Garuda Muda Football Academy tertarik menjalin kerja sama dengan Ayres Apparel sebagai penyedia jersey dan perlengkapan latihan. Kami memiliki lebih dari 150 siswa aktif dan rutin mengikuti turnamen tingkat daerah maupun nasional. Diharapkan kerja sama ini dapat meningkatkan kualitas perlengkapan tim serta memperkuat branding kedua belah pihak.');

-- --------------------------------------------------------

--
-- Table structure for table `ssb_billing_config`
--

CREATE TABLE `ssb_billing_config` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ssb_id` bigint(20) UNSIGNED NOT NULL,
  `billing_type` enum('MONTHLY','REGISTRATION_SESSION','MONTHLY_SESSION') NOT NULL,
  `monthly_fee` decimal(12,0) UNSIGNED DEFAULT NULL,
  `registration_fee` decimal(12,0) UNSIGNED DEFAULT NULL,
  `session_fee` decimal(12,0) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ssb_billing_config`
--

INSERT INTO `ssb_billing_config` (`id`, `ssb_id`, `billing_type`, `monthly_fee`, `registration_fee`, `session_fee`, `created_at`, `updated_at`) VALUES
(6, 8, 'MONTHLY', 250000, 500000, NULL, '2026-03-28 07:26:01', '2026-03-28 07:26:01');

-- --------------------------------------------------------

--
-- Table structure for table `tournaments`
--

CREATE TABLE `tournaments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ssb_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `tournament_date` date NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tournaments`
--

INSERT INTO `tournaments` (`id`, `ssb_id`, `name`, `title`, `tournament_date`, `description`, `created_at`, `updated_at`) VALUES
(2, 8, 'PRESIDEN CUP 2026', 'JUARA 2', '2026-03-13', NULL, '2026-03-28 07:20:51', '2026-03-28 07:20:56'),
(3, 8, 'BRI LIGA 1', 'JUARA 3', '2026-03-26', NULL, '2026-03-28 07:24:31', '2026-03-28 07:24:31');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ssb_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('INCOME','EXPENSE') NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` decimal(12,0) UNSIGNED NOT NULL,
  `transaction_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `ssb_id`, `type`, `description`, `amount`, `transaction_date`, `created_at`, `updated_at`) VALUES
(3, 8, 'INCOME', 'SPONSOR', 5000000, '2026-03-20', '2026-03-28 07:33:36', '2026-03-28 07:33:36'),
(4, 8, 'EXPENSE', 'Sewa Lapangan', 1350000, '2026-03-30', '2026-03-28 07:34:04', '2026-03-28 07:34:04'),
(5, 8, 'EXPENSE', 'Transport', 250000, '2026-03-28', '2026-03-28 07:34:23', '2026-03-28 07:34:23');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ssb_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('AYRES_ADMIN','SSB_ADMIN','PELATIH') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `ssb_id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Admin Ayres', 'admin@ayres.local', 'scrypt$f6f5a9439e142f2d0ab311f11a364118$4ae2c1d8ef0181e5a2d7f8c7cd57d3c8600d211c806492e931faaa952d986aa38737df2215c6ee97069281f1a641678a60bdd2e7e9f1dda727cde29a501ab9ba', 'AYRES_ADMIN', '2026-03-09 03:06:04', '2026-03-27 07:04:38'),
(9, 8, 'Sashastra', 'garuda@gmail.com', 'scrypt$415f8c5e8bd8e2e01c9f617667178b6a$8f5b05f738278b1b1eaf4709e9941614fa47dfdb72aeeda938119a7a65a9b2c429422760616b49058b353bbfe8f57235f05ccedef9e80ac84f7b648c5167dcbd', 'SSB_ADMIN', '2026-03-28 07:10:54', '2026-03-28 07:10:54'),
(10, 8, 'ZETACO', 'pelatih@gmail.com', 'scrypt$bb4add0a98a92542c2755b892dfa653d$69bce2d21bba256d441c7dd0affbff3b55b2fbcb88e216dcfeed7cd58c9abef4d2c24185c50af6987c13c8d5b759e53e462191c1268de551c2e22cfcaa5e2b75', 'PELATIH', '2026-03-28 07:10:54', '2026-03-28 07:10:54');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `age_groups`
--
ALTER TABLE `age_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_age_groups_ssb_id` (`ssb_id`);

--
-- Indexes for table `participants`
--
ALTER TABLE `participants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_participants_ssb_id` (`ssb_id`),
  ADD KEY `idx_participants_name` (`name`),
  ADD KEY `idx_participants_status` (`status`),
  ADD KEY `idx_participants_position` (`position`),
  ADD KEY `idx_participants_join_date` (`join_date`);

--
-- Indexes for table `partnerships`
--
ALTER TABLE `partnerships`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_partnerships_ssb_id` (`ssb_id`),
  ADD KEY `idx_partnerships_status` (`status`),
  ADD KEY `idx_partnerships_period` (`start_date`,`end_date`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payments_ssb_id` (`ssb_id`),
  ADD KEY `idx_payments_participant_id` (`participant_id`),
  ADD KEY `idx_payments_status` (`status`),
  ADD KEY `idx_payments_period` (`ssb_id`,`period_month`),
  ADD KEY `idx_payments_type` (`payment_type`);

--
-- Indexes for table `ssb`
--
ALTER TABLE `ssb`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ssb_name` (`name`);

--
-- Indexes for table `ssb_billing_config`
--
ALTER TABLE `ssb_billing_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_billing_config_ssb_id` (`ssb_id`);

--
-- Indexes for table `tournaments`
--
ALTER TABLE `tournaments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tournaments_ssb_id` (`ssb_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_transactions_ssb_id` (`ssb_id`),
  ADD KEY `idx_transactions_type` (`type`),
  ADD KEY `idx_transactions_date` (`ssb_id`,`transaction_date`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_ssb_id` (`ssb_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `age_groups`
--
ALTER TABLE `age_groups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `participants`
--
ALTER TABLE `participants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `partnerships`
--
ALTER TABLE `partnerships`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `ssb`
--
ALTER TABLE `ssb`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `ssb_billing_config`
--
ALTER TABLE `ssb_billing_config`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tournaments`
--
ALTER TABLE `tournaments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `age_groups`
--
ALTER TABLE `age_groups`
  ADD CONSTRAINT `fk_age_groups_ssb` FOREIGN KEY (`ssb_id`) REFERENCES `ssb` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `participants`
--
ALTER TABLE `participants`
  ADD CONSTRAINT `fk_participants_ssb` FOREIGN KEY (`ssb_id`) REFERENCES `ssb` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `partnerships`
--
ALTER TABLE `partnerships`
  ADD CONSTRAINT `fk_partnerships_ssb` FOREIGN KEY (`ssb_id`) REFERENCES `ssb` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_participant` FOREIGN KEY (`participant_id`) REFERENCES `participants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payments_ssb` FOREIGN KEY (`ssb_id`) REFERENCES `ssb` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ssb_billing_config`
--
ALTER TABLE `ssb_billing_config`
  ADD CONSTRAINT `fk_billing_config_ssb` FOREIGN KEY (`ssb_id`) REFERENCES `ssb` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tournaments`
--
ALTER TABLE `tournaments`
  ADD CONSTRAINT `fk_tournaments_ssb` FOREIGN KEY (`ssb_id`) REFERENCES `ssb` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_transactions_ssb` FOREIGN KEY (`ssb_id`) REFERENCES `ssb` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_ssb` FOREIGN KEY (`ssb_id`) REFERENCES `ssb` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
