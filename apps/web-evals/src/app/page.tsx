import { getRuns } from "@researcherry-ai/evals"

import { Runs } from "@/components/home/runs"

export const dynamic = "force-dynamic"

export default async function Page() {
	const runs = await getRuns()
	return <Runs runs={runs} />
}
