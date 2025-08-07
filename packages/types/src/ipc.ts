import { z } from "zod"

import { clineMessageSchema, tokenUsageSchema } from "./message.js"
import { toolNamesSchema, toolUsageSchema } from "./tool.js"
import { neiraCoderSettingsSchema } from "./global-settings.js"

/**
 * isSubtaskSchema
 */
export const isSubtaskSchema = z.object({
	isSubtask: z.boolean(),
})
export type IsSubtask = z.infer<typeof isSubtaskSchema>

/**
 * NeiraCoderEvent
 */

export enum NeiraCoderEventName {
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

export const neiraCoderEventsSchema = z.object({
	[NeiraCoderEventName.Message]: z.tuple([
		z.object({
			taskId: z.string(),
			action: z.union([z.literal("created"), z.literal("updated")]),
			message: clineMessageSchema,
		}),
	]),
	[NeiraCoderEventName.TaskCreated]: z.tuple([z.string()]),
	[NeiraCoderEventName.TaskStarted]: z.tuple([z.string()]),
	[NeiraCoderEventName.TaskModeSwitched]: z.tuple([z.string(), z.string()]),
	[NeiraCoderEventName.TaskPaused]: z.tuple([z.string()]),
	[NeiraCoderEventName.TaskUnpaused]: z.tuple([z.string()]),
	[NeiraCoderEventName.TaskAskResponded]: z.tuple([z.string()]),
	[NeiraCoderEventName.TaskAborted]: z.tuple([z.string()]),
	[NeiraCoderEventName.TaskSpawned]: z.tuple([z.string(), z.string()]),
	[NeiraCoderEventName.TaskCompleted]: z.tuple([z.string(), tokenUsageSchema, toolUsageSchema, isSubtaskSchema]),
	[NeiraCoderEventName.TaskTokenUsageUpdated]: z.tuple([z.string(), tokenUsageSchema]),
	[NeiraCoderEventName.TaskToolFailed]: z.tuple([z.string(), toolNamesSchema, z.string()]),
})

export type NeiraCoderEvents = z.infer<typeof neiraCoderEventsSchema>

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
			configuration: neiraCoderSettingsSchema,
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
		eventName: z.literal(NeiraCoderEventName.Message),
		payload: neiraCoderEventsSchema.shape[NeiraCoderEventName.Message],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(NeiraCoderEventName.TaskCreated),
		payload: neiraCoderEventsSchema.shape[NeiraCoderEventName.TaskCreated],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(NeiraCoderEventName.TaskStarted),
		payload: neiraCoderEventsSchema.shape[NeiraCoderEventName.TaskStarted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(NeiraCoderEventName.TaskModeSwitched),
		payload: neiraCoderEventsSchema.shape[NeiraCoderEventName.TaskModeSwitched],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(NeiraCoderEventName.TaskPaused),
		payload: neiraCoderEventsSchema.shape[NeiraCoderEventName.TaskPaused],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(NeiraCoderEventName.TaskUnpaused),
		payload: neiraCoderEventsSchema.shape[NeiraCoderEventName.TaskUnpaused],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(NeiraCoderEventName.TaskAskResponded),
		payload: neiraCoderEventsSchema.shape[NeiraCoderEventName.TaskAskResponded],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(NeiraCoderEventName.TaskAborted),
		payload: neiraCoderEventsSchema.shape[NeiraCoderEventName.TaskAborted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(NeiraCoderEventName.TaskSpawned),
		payload: neiraCoderEventsSchema.shape[NeiraCoderEventName.TaskSpawned],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(NeiraCoderEventName.TaskCompleted),
		payload: neiraCoderEventsSchema.shape[NeiraCoderEventName.TaskCompleted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(NeiraCoderEventName.TaskTokenUsageUpdated),
		payload: neiraCoderEventsSchema.shape[NeiraCoderEventName.TaskTokenUsageUpdated],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(NeiraCoderEventName.TaskToolFailed),
		payload: neiraCoderEventsSchema.shape[NeiraCoderEventName.TaskToolFailed],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(NeiraCoderEventName.EvalPass),
		payload: z.undefined(),
		taskId: z.number(),
	}),
	z.object({
		eventName: z.literal(NeiraCoderEventName.EvalFail),
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
