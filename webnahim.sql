-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-09-2025 a las 18:27:24
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `webnahim`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bitacora_semestre`
--

CREATE TABLE `bitacora_semestre` (
  `ID` int(11) NOT NULL,
  `ID_semestre` int(11) DEFAULT NULL,
  `ID_docente` int(11) DEFAULT NULL,
  `ID_requisito` int(11) DEFAULT NULL,
  `cumple` tinyint(1) DEFAULT 0,
  `estado` enum('Cumple','No Cumple','Incompleto') DEFAULT 'Incompleto',
  `comentario` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `bitacora_semestre`
--

INSERT INTO `bitacora_semestre` (`ID`, `ID_semestre`, `ID_docente`, `ID_requisito`, `cumple`, `estado`, `comentario`) VALUES
(162, 4, 3, 1, 0, 'Incompleto', NULL),
(163, 4, 3, 3, 0, 'Cumple', 'todo bien'),
(164, 4, 3, 4, 0, 'No Cumple', NULL),
(167, 4, 4, 1, 0, 'Incompleto', NULL),
(168, 4, 4, 3, 0, 'Incompleto', NULL),
(169, 4, 4, 4, 0, 'Incompleto', NULL),
(172, 4, 3, 1, 0, 'Incompleto', NULL),
(173, 4, 3, 3, 0, 'Cumple', 'todo bien'),
(174, 4, 3, 4, 0, 'No Cumple', NULL),
(327, 4, 3, 5, 0, 'Incompleto', ''),
(329, 4, 4, 5, 0, 'Incompleto', ''),
(331, 4, 5, 1, 0, 'Incompleto', ''),
(332, 4, 5, 3, 0, 'Incompleto', ''),
(333, 4, 5, 4, 0, 'Incompleto', ''),
(334, 4, 5, 5, 0, 'Incompleto', ''),
(362, 4, 3, 6, 0, 'Incompleto', ''),
(363, 4, 4, 6, 0, 'Incompleto', ''),
(364, 4, 5, 6, 0, 'Incompleto', ''),
(365, 6, 3, 1, 0, 'Cumple', NULL),
(366, 6, 3, 3, 0, 'No Cumple', 'Le falta la fecha'),
(367, 6, 3, 4, 0, 'Cumple', NULL),
(368, 6, 3, 5, 0, 'Cumple', NULL),
(369, 6, 3, 6, 0, 'Incompleto', NULL),
(370, 6, 4, 1, 0, 'Incompleto', NULL),
(371, 6, 4, 3, 0, 'No Cumple', 'kdjdkh'),
(372, 6, 4, 4, 0, 'Incompleto', NULL),
(373, 6, 4, 5, 0, 'Incompleto', NULL),
(374, 6, 4, 6, 0, 'Incompleto', 'dhdhhd'),
(380, 6, 5, 1, 0, 'Incompleto', ''),
(381, 6, 5, 3, 0, 'Incompleto', ''),
(382, 6, 5, 4, 0, 'Incompleto', ''),
(383, 6, 5, 5, 0, 'Incompleto', ''),
(384, 6, 5, 6, 0, 'Incompleto', '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `docentes`
--

CREATE TABLE `docentes` (
  `ID_docente` int(11) NOT NULL,
  `nombre` varchar(70) NOT NULL,
  `AP_Paterno` varchar(50) NOT NULL,
  `AP_Materno` varchar(50) NOT NULL,
  `carrera` varchar(100) NOT NULL,
  `fec_Regist` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `docentes`
--

INSERT INTO `docentes` (`ID_docente`, `nombre`, `AP_Paterno`, `AP_Materno`, `carrera`, `fec_Regist`) VALUES
(3, 'Suzel', 'Rivera', 'Gomez', 'Sistemas', '2025-05-09'),
(4, 'María Leticia', 'Loaeza', 'Cano', 'Sistemas', '2025-05-09'),
(5, 'Joel', 'Loaeza', 'Martinez', 'Sistemas', '2025-05-09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `requisitos`
--

CREATE TABLE `requisitos` (
  `ID_requisitos` int(11) NOT NULL,
  `requisitoTipo` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `requisitos`
--

INSERT INTO `requisitos` (`ID_requisitos`, `requisitoTipo`) VALUES
(1, 'PLANEACION'),
(3, 'REPORTE INICIAL'),
(4, 'Reporte Parcial SEM 8'),
(5, 'REPORTE FINAL SEM 16'),
(6, 'REV. CARPETA GC SEM 8');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `semestres`
--

CREATE TABLE `semestres` (
  `ID_semestre` int(11) NOT NULL,
  `nomSem` varchar(70) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `semestres`
--

INSERT INTO `semestres` (`ID_semestre`, `nomSem`, `fecha_inicio`, `fecha_fin`) VALUES
(4, 'Agosto-Diciembre 2025', '2025-05-09', '2025-12-11'),
(6, 'Agosto-Diciembre 2026', '2025-08-18', '2025-12-16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `ID_user` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(45) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isAdmin` bit(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`ID_user`, `name`, `email`, `password`, `isAdmin`) VALUES
(6, 'admin', 'admin@ejemplo.com', '$2y$10$RFpbtGYxuXGYzS5.eqO3rubP76HohTYfZaBxe0N.ydg3awVJDgqle', b'1');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `bitacora_semestre`
--
ALTER TABLE `bitacora_semestre`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_semestre` (`ID_semestre`),
  ADD KEY `ID_docente` (`ID_docente`),
  ADD KEY `ID_requisito` (`ID_requisito`);

--
-- Indices de la tabla `docentes`
--
ALTER TABLE `docentes`
  ADD PRIMARY KEY (`ID_docente`);

--
-- Indices de la tabla `requisitos`
--
ALTER TABLE `requisitos`
  ADD PRIMARY KEY (`ID_requisitos`);

--
-- Indices de la tabla `semestres`
--
ALTER TABLE `semestres`
  ADD PRIMARY KEY (`ID_semestre`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID_user`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `bitacora_semestre`
--
ALTER TABLE `bitacora_semestre`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=385;

--
-- AUTO_INCREMENT de la tabla `docentes`
--
ALTER TABLE `docentes`
  MODIFY `ID_docente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `requisitos`
--
ALTER TABLE `requisitos`
  MODIFY `ID_requisitos` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `semestres`
--
ALTER TABLE `semestres`
  MODIFY `ID_semestre` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `ID_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `bitacora_semestre`
--
ALTER TABLE `bitacora_semestre`
  ADD CONSTRAINT `bitacora_semestre_ibfk_1` FOREIGN KEY (`ID_semestre`) REFERENCES `semestres` (`ID_semestre`),
  ADD CONSTRAINT `bitacora_semestre_ibfk_2` FOREIGN KEY (`ID_docente`) REFERENCES `docentes` (`ID_docente`),
  ADD CONSTRAINT `bitacora_semestre_ibfk_3` FOREIGN KEY (`ID_requisito`) REFERENCES `requisitos` (`ID_requisitos`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
