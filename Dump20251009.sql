CREATE DATABASE  IF NOT EXISTS `webnahim` /*!40100 DEFAULT CHARACTER SET utf8 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `webnahim`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: webnahim
-- ------------------------------------------------------
-- Server version	8.0.17

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bitacora_semestre`
--

DROP TABLE IF EXISTS `bitacora_semestre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bitacora_semestre` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ID_semestre` int(11) DEFAULT NULL,
  `ID_docente` int(11) DEFAULT NULL,
  `ID_requisito` int(11) DEFAULT NULL,
  `cumple` tinyint(1) DEFAULT '0',
  `estado` enum('Cumple','No Cumple','Incompleto') DEFAULT 'Incompleto',
  `comentario` text,
  PRIMARY KEY (`ID`),
  KEY `idx_semestre` (`ID_semestre`),
  KEY `idx_docente` (`ID_docente`),
  KEY `idx_requisito` (`ID_requisito`),
  CONSTRAINT `fk_bitacora_docente` FOREIGN KEY (`ID_docente`) REFERENCES `docentes` (`ID_docente`),
  CONSTRAINT `fk_bitacora_requisito` FOREIGN KEY (`ID_requisito`) REFERENCES `requisitos` (`ID_requisitos`),
  CONSTRAINT `fk_bitacora_semestre` FOREIGN KEY (`ID_semestre`) REFERENCES `semestres` (`ID_semestre`)
) ENGINE=InnoDB AUTO_INCREMENT=385 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bitacora_semestre`
--

LOCK TABLES `bitacora_semestre` WRITE;
/*!40000 ALTER TABLE `bitacora_semestre` DISABLE KEYS */;
INSERT INTO `bitacora_semestre` VALUES (162,4,3,1,0,'Incompleto',NULL),(163,4,3,3,0,'Cumple','todo bien'),(164,4,3,4,0,'No Cumple',NULL),(167,4,4,1,0,'Incompleto',NULL),(168,4,4,3,0,'Incompleto',NULL),(169,4,4,4,0,'Incompleto',NULL),(172,4,3,1,0,'Incompleto',NULL),(173,4,3,3,0,'Cumple','todo bien'),(174,4,3,4,0,'No Cumple',NULL),(327,4,3,5,0,'Incompleto',''),(329,4,4,5,0,'Incompleto',''),(362,4,3,6,0,'Incompleto',''),(363,4,4,6,0,'Incompleto',''),(365,6,3,1,0,'Cumple',NULL),(366,6,3,3,0,'No Cumple','Le falta la fecha'),(367,6,3,4,0,'Cumple',NULL),(368,6,3,5,0,'Cumple',NULL),(369,6,3,6,0,'Incompleto',NULL),(370,6,4,1,0,'Incompleto',NULL),(371,6,4,3,0,'No Cumple','kdjdkh'),(372,6,4,4,0,'Incompleto',NULL),(373,6,4,5,0,'Incompleto',NULL),(374,6,4,6,0,'Incompleto','dhdhhd');
/*!40000 ALTER TABLE `bitacora_semestre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `docentes`
--

DROP TABLE IF EXISTS `docentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `docentes` (
  `ID_docente` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(70) NOT NULL,
  `AP_Paterno` varchar(50) NOT NULL,
  `AP_Materno` varchar(50) NOT NULL,
  `carrera` varchar(100) NOT NULL,
  `fec_Regist` date NOT NULL,
  PRIMARY KEY (`ID_docente`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `docentes`
--

LOCK TABLES `docentes` WRITE;
/*!40000 ALTER TABLE `docentes` DISABLE KEYS */;
INSERT INTO `docentes` VALUES (3,'Suzel','Rivera','Gomez','Sistemas','2025-05-09'),(4,'María Leticia','Loaeza','Cano','Sistemas','2025-05-09');
/*!40000 ALTER TABLE `docentes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requisitos`
--

DROP TABLE IF EXISTS `requisitos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requisitos` (
  `ID_requisitos` int(11) NOT NULL AUTO_INCREMENT,
  `requisitoTipo` varchar(100) NOT NULL,
  PRIMARY KEY (`ID_requisitos`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requisitos`
--

LOCK TABLES `requisitos` WRITE;
/*!40000 ALTER TABLE `requisitos` DISABLE KEYS */;
INSERT INTO `requisitos` VALUES (1,'PLANEACIONN'),(3,'REPORTE INICIAL'),(4,'Reporte Parcial SEM 8'),(5,'REPORTE FINAL SEM 16'),(6,'REV. CARPETA GC SEM 8');
/*!40000 ALTER TABLE `requisitos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `semestres`
--

DROP TABLE IF EXISTS `semestres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `semestres` (
  `ID_semestre` int(11) NOT NULL AUTO_INCREMENT,
  `nomSem` varchar(70) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  PRIMARY KEY (`ID_semestre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `semestres`
--

LOCK TABLES `semestres` WRITE;
/*!40000 ALTER TABLE `semestres` DISABLE KEYS */;
INSERT INTO `semestres` VALUES (4,'Agosto-Diciembre 2025','2025-05-09','2025-12-11'),(6,'Agosto-Diciembre 2026','2025-08-18','2025-12-16');
/*!40000 ALTER TABLE `semestres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `ID_user` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `email` varchar(45) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isAdmin` bit(1) NOT NULL,
  PRIMARY KEY (`ID_user`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (6,'admin','admin@ejemplo.com','$2y$10$1wuOb5dCM9s5aRilhkcImu8WnNWvLbix.9U05vW80hNSgaTD9XWii',_binary '');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `ID_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_usuario`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin','admin@test.com','.9lFffv8zLp6','2025-09-24 01:05:12');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-09 14:43:28
