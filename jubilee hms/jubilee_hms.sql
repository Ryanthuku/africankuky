-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 08, 2025 at 11:49 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jubilee_hms`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `appointment_date` datetime NOT NULL,
  `status` varchar(50) DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctor_notes`
--

CREATE TABLE `doctor_notes` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lab_records`
--

CREATE TABLE `lab_records` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `test_type` varchar(100) NOT NULL,
  `test_date` date NOT NULL,
  `result` text NOT NULL,
  `doctor_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lab_records`
--

INSERT INTO `lab_records` (`id`, `patient_id`, `test_type`, `test_date`, `result`, `doctor_id`, `created_at`) VALUES
(14, 11, 'common cold', '2025-06-19', 'infected', 11, '2025-06-12 06:18:24'),
(15, 13, 'malaria', '2025-06-19', 'infected', 7, '2025-06-12 06:40:04'),
(17, 17, 'malaria', '2025-06-19', '', 6, '2025-06-19 09:26:07');

-- --------------------------------------------------------

--
-- Table structure for table `medications`
--

CREATE TABLE `medications` (
  `id` int(11) NOT NULL,
  `drug_name` varchar(100) NOT NULL,
  `stock` int(11) NOT NULL,
  `expiry` date NOT NULL,
  `manufacturer` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medications`
--

INSERT INTO `medications` (`id`, `drug_name`, `stock`, `expiry`, `manufacturer`, `created_at`) VALUES
(8, 'COUGH SYRUP', 5, '2025-06-01', 'marigi', '2025-06-12 06:17:07'),
(9, 'admil', 10, '2026-01-12', 'njoki', '2025-06-12 06:44:49'),
(10, 'vita health', 12, '2026-05-12', 'marigi', '2025-06-12 06:47:05'),
(11, 'vita health', 12, '2026-05-12', 'marigi', '2025-06-14 10:13:50');

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `dob` date NOT NULL,
  `address` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `ailment` varchar(255) NOT NULL,
  `assigned_doctor_id` int(11) DEFAULT NULL,
  `appointment date` date NOT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `first_name`, `dob`, `address`, `mobile`, `ailment`, `assigned_doctor_id`, `appointment date`, `status`, `created_at`) VALUES
(11, 'jeremy', '2024-09-04', '0900', '0113850430', 'common cold', 11, '0000-00-00', 'active', '2025-06-12 06:16:46'),
(13, 'ryan', '2025-06-01', '0900', '0113850430', 'malaria', 7, '0000-00-00', 'active', '2025-06-12 06:39:38'),
(16, 'monica marigi', '2025-02-27', '0900', '0113850430', 'flu', 6, '0000-00-00', 'active', '2025-06-14 11:59:34'),
(17, 'collins', '2025-06-02', '0800', '0783720190', 'Jiggers', 7, '0000-00-00', 'active', '2025-06-19 05:00:30'),
(19, 'ryan', '2025-06-22', '0900', '0113850430', 'malaria', 7, '0000-00-00', 'active', '2025-06-22 05:34:21'),
(20, 'ryan', '2025-06-22', '0900', '0113850430', 'malaria', 6, '0000-00-00', 'active', '2025-09-03 17:35:07');

-- --------------------------------------------------------

--
-- Table structure for table `prescriptions`
--

CREATE TABLE `prescriptions` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `medication` varchar(255) NOT NULL,
  `prescribed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prescriptions`
--

INSERT INTO `prescriptions` (`id`, `patient_id`, `doctor_id`, `medication`, `prescribed_at`) VALUES
(10, 17, 6, 'advil', '2025-06-19 09:25:07');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('doctor','admin') NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `name`, `email`, `created_at`) VALUES
(5, 'admin1', '$2y$10$58GH7jVen43nVU9vd3K1/uvZF9fJAtQ6CLFqQT4qfgIm6wDcMOmvK', 'admin', 'Admin One', 'admin1@example.com', '2025-05-26 12:24:24'),
(6, 'doctor1', '$2y$10$58GH7jVen43nVU9vd3K1/uvZF9fJAtQ6CLFqQT4qfgIm6wDcMOmvK', 'doctor', 'Doctor One', 'doctor1@example.com', '2025-05-26 12:24:24'),
(7, 'admin1@example.com', '$2y$10$LDK9qYrjlZA48FNHfUT3ceY8b5NVFEShCGaKNYsLmyf3lOoyLqax2', 'doctor', 'ryan marigi', 'ryanmarigi014@gmail.com', '2025-05-26 15:14:45'),
(11, 'marigi', '$2y$10$8PBujCWH99EXe4jodh8uXOkx7FLgCc5AKhXkMwQpXUTMQh2F4ipKe', 'doctor', 'marigi thuku', 'marigithuku@gmail.com', '2025-05-26 16:33:26'),
(12, 'violet', '$2y$10$nKEWt/p6hv0NbJ/7FSnvv.uMKmV6yCy/KhBjuMVmnAXqT0Q2.eQ6m', 'doctor', 'violet waithera', 'violet@gmail.com', '2025-06-01 05:08:31'),
(13, 'hailey', '$2y$10$DAauzsnIecnp.D29rPES9.8Xr7lKYeQmHu05FVaBxvvR99WECu/Du', 'doctor', 'hayley njoki', 'hailey@gmail.com', '2025-06-01 16:42:36'),
(14, 'jeremy', '$2y$10$j.IYmI4vhZYN.C6aosblQuOrY6V/aD.w875TDrTgmHZW.M1aDdqqO', 'admin', 'jeremy mwangi', 'jeremy@gmail.com', '2025-06-01 19:27:51');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_id` (`doctor_id`);

--
-- Indexes for table `doctor_notes`
--
ALTER TABLE `doctor_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_id` (`doctor_id`);

--
-- Indexes for table `lab_records`
--
ALTER TABLE `lab_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_id` (`doctor_id`);

--
-- Indexes for table `medications`
--
ALTER TABLE `medications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assigned_doctor_id` (`assigned_doctor_id`);

--
-- Indexes for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_id` (`doctor_id`);

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
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `doctor_notes`
--
ALTER TABLE `doctor_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `lab_records`
--
ALTER TABLE `lab_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `medications`
--
ALTER TABLE `medications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `prescriptions`
--
ALTER TABLE `prescriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `doctor_notes`
--
ALTER TABLE `doctor_notes`
  ADD CONSTRAINT `doctor_notes_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `doctor_notes_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lab_records`
--
ALTER TABLE `lab_records`
  ADD CONSTRAINT `lab_records_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lab_records_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`assigned_doctor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD CONSTRAINT `prescriptions_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prescriptions_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
