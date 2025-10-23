CREATE TABLE `auditLogs` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` varchar(64) NOT NULL,
	`details` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` varchar(64) NOT NULL,
	`fileId` varchar(64),
	`folderId` varchar(64),
	`content` text NOT NULL,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` varchar(64) NOT NULL,
	`folderId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('upload','link') NOT NULL,
	`fileUrl` text,
	`fileType` varchar(100),
	`fileSize` varchar(50),
	`externalUrl` text,
	`linkPlatform` enum('onedrive','googledrive','other'),
	`description` text,
	`uploadedBy` varchar(64) NOT NULL,
	`uploadedAt` timestamp DEFAULT (now()),
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `folders` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('tribunais','pareceres','outros_assuntos','honorarios') NOT NULL,
	`parentId` varchar(64),
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`tribunal` text,
	`local` text,
	`numeroProcesso` varchar(255),
	`juizo` text,
	`tipoAcao` text,
	`dataParecer` timestamp,
	`nomeParecer` text,
	CONSTRAINT `folders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('upload','comment','folder_created','link_shared') NOT NULL,
	`entityId` varchar(64),
	`read` enum('yes','no') NOT NULL DEFAULT 'no',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
