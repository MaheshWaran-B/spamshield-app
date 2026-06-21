CREATE TABLE `call_scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phoneNumberHash` varchar(256) NOT NULL,
	`riskScore` int NOT NULL,
	`verdict` enum('spam','safe','warning') NOT NULL,
	`reportCount` int NOT NULL DEFAULT 0,
	`aiReasoning` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `call_scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`senderEmail` varchar(320) NOT NULL,
	`subject` text NOT NULL,
	`bodyHash` varchar(256) NOT NULL,
	`category` enum('inbox','promotions','spam','phishing') NOT NULL,
	`confidenceScore` int NOT NULL,
	`threatLevel` enum('safe','warning','critical') NOT NULL,
	`aiReasoning` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sms_scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`messageText` text NOT NULL,
	`messageHash` varchar(256) NOT NULL,
	`riskScore` int NOT NULL,
	`verdict` enum('spam','safe','warning') NOT NULL,
	`spamKeywords` text,
	`aiReasoning` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sms_scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalScanned` int NOT NULL DEFAULT 0,
	`spamBlocked` int NOT NULL DEFAULT 0,
	`safeCount` int NOT NULL DEFAULT 0,
	`warningCount` int NOT NULL DEFAULT 0,
	`overallSafetyScore` int NOT NULL DEFAULT 100,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_stats_userId_unique` UNIQUE(`userId`)
);
