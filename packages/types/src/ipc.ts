import { z } from "zod"

import { clineMessageSchema, tokenUsageSchema } from "./message.js"
import { toolNamesSchema, toolUsageSchema } from "./tool.js"
import { researcherryCoderSettingsSchema } from "./global-settings.js"

/**
 * isSubtaskSchema
 */
export const isSubtaskSchema = z.object({
	isSubtask: z.boolean(),
})
export type IsSubtask = z.infer<typeof isSubtaskSchema>

/**
 * ResearcherryCoderEvent
 */

export enum ResearcherryCoderEventName {
	Message = "message",
	TaskCreated = "taskCreated",
	TaskStarted = "taskStarted",
	TaskModeSwitched = "taskModeSwitched",
	TaskPaused = "taskPaused",
	TaskUnpaused = "taskUnpaused",
	TaskAskResponded = "taskAskResponded",
	TaskAborted = "taskAborted",
	TaskSpawned = "taskSpawned",
	TaskCompleted = "taskCompleted",
	TaskTokenUsageUpdated = "taskTokenUsageUpdated",
	TaskToolFailed = "taskToolFailed",
	EvalPass = "evalPass",
	EvalFail = "evalFail",
}

export const researcherryCoderEventsSchema = z.object({
	[ResearcherryCoderEventName.Message]: z.tuple([
		z.object({
			taskId: z.string(),
			action: z.union([z.literal("created"), z.literal("updated")]),
			message: clineMessageSchema,
		}),
	]),
	[ResearcherryCoderEventName.TaskCreated]: z.tuple([z.string()]),
	[ResearcherryCoderEventName.TaskStarted]: z.tuple([z.string()]),
	[ResearcherryCoderEventName.TaskModeSwitched]: z.tuple([z.string(), z.string()]),
	[ResearcherryCoderEventName.TaskPaused]: z.tuple([z.string()]),
	[ResearcherryCoderEventName.TaskUnpaused]: z.tuple([z.string()]),
	[ResearcherryCoderEventName.TaskAskResponded]: z.tuple([z.string()]),
	[ResearcherryCoderEventName.TaskAborted]: z.tuple([z.string()]),
	[ResearcherryCoderEventName.TaskSpawned]: z.tuple([z.string(), z.string()]),
	[ResearcherryCoderEventName.TaskCompleted]: z.tuple([
		z.string(),
		tokenUsageSchema,
		toolUsageSchema,
		isSubtaskSchema,
	]),
	[ResearcherryCoderEventName.TaskTokenUsageUpdated]: z.tuple([z.string(), tokenUsageSchema]),
	[ResearcherryCoderEventName.TaskToolFailed]: z.tuple([z.string(), toolNamesSchema, z.string()]),
})

export type ResearcherryCoderEvents = z.infer<typeof researcherryCoderEventsSchema>

/**
 * Ack
 */

export const ackSchema = z.object({
	clientId: z.string(),
	pid: z.number(),
	ppid: z.number(),
})

export type Ack = z.infer<typeof ackSchema>

/**
 * TaskCommand
 */

export enum TaskCommandName {
	StartNewTask = "StartNewTask",
	CancelTask = "CancelTask",
	CloseTask = "CloseTask",
}

export const taskCommandSchema = z.discriminatedUnion("commandName", [
	z.object({
		commandName: z.literal(TaskCommandName.StartNewTask),
		data: z.object({
			configuration: researcherryCoderSettingsSchema,
			text: z.string(),
			images: z.array(z.string()).optional(),
			newTab: z.boolean().optional(),
		}),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.CancelTask),
		data: z.string(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.CloseTask),
		data: z.string(),
	}),
])

export type TaskCommand = z.infer<typeof taskCommandSchema>

/**
 * TaskEvent
 */

export const taskEventSchema = z.discriminatedUnion("eventName", [
	z.object({
		eventName: z.literal(ResearcherryCoderEventName.Message),
		payload: researcherryCoderEventsSchema.shape[ResearcherryCoderEventName.Message],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ResearcherryCoderEventName.TaskCreated),
		payload: researcherryCoderEventsSchema.shape[ResearcherryCoderEventName.TaskCreated],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ResearcherryCoderEventName.TaskStarted),
		payload: researcherryCoderEventsSchema.shape[ResearcherryCoderEventName.TaskStarted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ResearcherryCoderEventName.TaskModeSwitched),
		payload: researcherryCoderEventsSchema.shape[ResearcherryCoderEventName.TaskModeSwitched],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ResearcherryCoderEventName.TaskPaused),
		payload: researcherryCoderEventsSchema.shape[ResearcherryCoderEventName.TaskPaused],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ResearcherryCoderEventName.TaskUnpaused),
		payload: researcherryCoderEventsSchema.shape[ResearcherryCoderEventName.TaskUnpaused],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ResearcherryCoderEventName.TaskAskResponded),
		payload: researcherryCoderEventsSchema.shape[ResearcherryCoderEventName.TaskAskResponded],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ResearcherryCoderEventName.TaskAborted),
		payload: researcherryCoderEventsSchema.shape[ResearcherryCoderEventName.TaskAborted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ResearcherryCoderEventName.TaskSpawned),
		payload: researcherryCoderEventsSchema.shape[ResearcherryCoderEventName.TaskSpawned],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ResearcherryCoderEventName.TaskCompleted),
		payload: researcherryCoderEventsSchema.shape[ResearcherryCoderEventName.TaskCompleted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ResearcherryCoderEventName.TaskTokenUsageUpdated),
		payload: researcherryCoderEventsSchema.shape[ResearcherryCoderEventName.TaskTokenUsageUpdated],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ResearcherryCoderEventName.TaskToolFailed),
		payload: researcherryCoderEventsSchema.shape[ResearcherryCoderEventName.TaskToolFailed],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ResearcherryCoderEventName.EvalPass),
		payload: z.undefined(),
		taskId: z.number(),
	}),
	z.object({
		eventName: z.literal(ResearcherryCoderEventName.EvalFail),
		payload: z.undefined(),
		taskId: z.number(),
	}),
])

export type TaskEvent = z.infer<typeof taskEventSchema>

/**
 * IpcMessage
 */

export enum IpcMessageType {
	Connect = "Connect",
	Disconnect = "Disconnect",
	Ack = "Ack",
	TaskCommand = "TaskCommand",
	TaskEvent = "TaskEvent",
}

export enum IpcOrigin {
	Client = "client",
	Server = "server",
}

export const ipcMessageSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal(IpcMessageType.Ack),
		origin: z.literal(IpcOrigin.Server),
		data: ackSchema,
	}),
	z.object({
		type: z.literal(IpcMessageType.TaskCommand),
		origin: z.literal(IpcOrigin.Client),
		clientId: z.string(),
		data: taskCommandSchema,
	}),
	z.object({
		type: z.literal(IpcMessageType.TaskEvent),
		origin: z.literal(IpcOrigin.Server),
		relayClientId: z.string().optional(),
		data: taskEventSchema,
	}),
])

export type IpcMessage = z.infer<typeof ipcMessageSchema>

/**
 * Client
 */

export type IpcClientEvents = {
	[IpcMessageType.Connect]: []
	[IpcMessageType.Disconnect]: []
	[IpcMessageType.Ack]: [data: Ack]
	[IpcMessageType.TaskCommand]: [data: TaskCommand]
	[IpcMessageType.TaskEvent]: [data: TaskEvent]
}

/**
 * Server
 */

export type IpcServerEvents = {
	[IpcMessageType.Connect]: [clientId: string]
	[IpcMessageType.Disconnect]: [clientId: string]
	[IpcMessageType.TaskCommand]: [clientId: string, data: TaskCommand]
	[IpcMessageType.TaskEvent]: [relayClientId: string | undefined, data: TaskEvent]
}
