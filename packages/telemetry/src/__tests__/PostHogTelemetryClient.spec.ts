import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { PostHogTelemetryClient } from "../PostHogTelemetryClient"
import { TelemetryEventName } from "@researcherry/types"

// Mock vscode
vi.mock("vscode", () => ({
	env: {
		machineId: "test-machine-id",
	},
	workspace: {
		getConfiguration: vi.fn(() => ({
			get: vi.fn(() => "all"),
		})),
	},
}))

describe("PostHogTelemetryClient", () => {
	let originalEnv: NodeJS.ProcessEnv

	beforeEach(() => {
		originalEnv = { ...process.env }
		vi.clearAllMocks()
	})

	afterEach(() => {
		process.env = originalEnv
	})

	it("should not initialize PostHog client when API key is missing", () => {
		// Remove POSTHOG_API_KEY from environment
		delete process.env.POSTHOG_API_KEY

		const client = new PostHogTelemetryClient(true) // debug mode

		// Client should be created without error
		expect(client).toBeDefined()

		// The internal PostHog client should be null
		expect((client as unknown as { client: unknown }).client).toBeNull()
	})

	it("should not initialize PostHog client when API key is empty", () => {
		// Set empty POSTHOG_API_KEY
		process.env.POSTHOG_API_KEY = ""

		const client = new PostHogTelemetryClient(true) // debug mode

		// Client should be created without error
		expect(client).toBeDefined()

		// The internal PostHog client should be null
		expect((client as unknown as { client: unknown }).client).toBeNull()
	})

	it("should not initialize PostHog client when API key is whitespace", () => {
		// Set whitespace POSTHOG_API_KEY
		process.env.POSTHOG_API_KEY = "   "

		const client = new PostHogTelemetryClient(true) // debug mode

		// Client should be created without error
		expect(client).toBeDefined()

		// The internal PostHog client should be null
		expect((client as unknown as { client: unknown }).client).toBeNull()
	})

	it("should handle capture gracefully when client is not initialized", async () => {
		delete process.env.POSTHOG_API_KEY

		const client = new PostHogTelemetryClient(true) // debug mode

		// Should not throw error when capturing event
		await expect(
			client.capture({
				event: TelemetryEventName.TASK_CREATED,
				properties: {},
			}),
		).resolves.not.toThrow()
	})

	it("should handle shutdown gracefully when client is not initialized", async () => {
		delete process.env.POSTHOG_API_KEY

		const client = new PostHogTelemetryClient(true) // debug mode

		// Should not throw error when shutting down
		await expect(client.shutdown()).resolves.not.toThrow()
	})

	it("should handle updateTelemetryState gracefully when client is not initialized", () => {
		delete process.env.POSTHOG_API_KEY

		const client = new PostHogTelemetryClient(true) // debug mode

		// Should not throw error when updating telemetry state
		expect(() => client.updateTelemetryState(true)).not.toThrow()
	})
})
