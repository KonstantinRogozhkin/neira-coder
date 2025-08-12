import { PostHog } from "posthog-node"
import * as vscode from "vscode"

import { TelemetryEventName, type TelemetryEvent } from "@researcherry/types"

import { BaseTelemetryClient } from "./BaseTelemetryClient"

/**
 * PostHogTelemetryClient handles telemetry event tracking for the Researcherry extension.
 * Uses PostHog analytics to track user interactions and system events.
 * Respects user privacy settings and VSCode's global telemetry configuration.
 */
export class PostHogTelemetryClient extends BaseTelemetryClient {
	private client: PostHog | null = null
	private distinctId: string = vscode.env.machineId
	// Git repository properties that should be filtered out
	private readonly gitPropertyNames = ["repositoryUrl", "repositoryName", "defaultBranch"]

	constructor(debug = false) {
		super(
			{
				type: "exclude",
				events: [TelemetryEventName.TASK_MESSAGE, TelemetryEventName.LLM_COMPLETION],
			},
			debug,
		)

		// Only create PostHog client if API key is available
		const apiKey = process.env.POSTHOG_API_KEY
		if (apiKey && apiKey.trim() !== "") {
			try {
				this.client = new PostHog(apiKey, { host: "https://us.i.posthog.com" })
			} catch (error) {
				console.warn("Failed to initialize PostHog client:", error)
				this.client = null
			}
		} else {
			if (debug) {
				console.info("PostHog API key not found, telemetry will be disabled")
			}
		}
	}

	/**
	 * Filter out git repository properties for PostHog telemetry
	 * @param propertyName The property name to check
	 * @returns Whether the property should be included in telemetry events
	 */
	protected override isPropertyCapturable(propertyName: string): boolean {
		// Filter out git repository properties
		if (this.gitPropertyNames.includes(propertyName)) {
			return false
		}
		return true
	}

	public override async capture(event: TelemetryEvent): Promise<void> {
		// Skip if client is not initialized
		if (!this.client) {
			if (this.debug) {
				console.info(
					`[PostHogTelemetryClient#capture] Skipping event: ${event.event} - PostHog client not initialized`,
				)
			}
			return
		}

		if (!this.isTelemetryEnabled() || !this.isEventCapturable(event.event)) {
			if (this.debug) {
				console.info(`[PostHogTelemetryClient#capture] Skipping event: ${event.event}`)
			}

			return
		}

		if (this.debug) {
			console.info(`[PostHogTelemetryClient#capture] ${event.event}`)
		}

		try {
			this.client.capture({
				distinctId: this.distinctId,
				event: event.event,
				properties: await this.getEventProperties(event),
			})
		} catch (error) {
			if (this.debug) {
				console.warn(`[PostHogTelemetryClient#capture] Failed to capture event: ${error}`)
			}
		}
	}

	/**
	 * Updates the telemetry state based on user preferences and VSCode settings.
	 * Only enables telemetry if both VSCode global telemetry is enabled and
	 * user has opted in.
	 * @param didUserOptIn Whether the user has explicitly opted into telemetry
	 */
	public override updateTelemetryState(didUserOptIn: boolean): void {
		this.telemetryEnabled = false

		// Skip if client is not initialized
		if (!this.client) {
			return
		}

		// First check global telemetry level - telemetry should only be enabled when level is "all".
		const telemetryLevel = vscode.workspace.getConfiguration("telemetry").get<string>("telemetryLevel", "all")
		const globalTelemetryEnabled = telemetryLevel === "all"

		// We only enable telemetry if global vscode telemetry is enabled.
		if (globalTelemetryEnabled) {
			this.telemetryEnabled = didUserOptIn
		}

		// Update PostHog client state based on telemetry preference.
		if (this.telemetryEnabled) {
			this.client.optIn()
		} else {
			this.client.optOut()
		}
	}

	public override async shutdown(): Promise<void> {
		if (this.client) {
			try {
				await this.client.shutdown()
			} catch (error) {
				if (this.debug) {
					console.warn("Failed to shutdown PostHog client:", error)
				}
			}
		}
	}
}
