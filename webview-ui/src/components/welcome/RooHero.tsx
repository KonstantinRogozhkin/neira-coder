import { useState } from "react"

const ResearcherryHero = () => {
	const [imagesBaseUri] = useState(() => {
		const w = window as any
		return w.IMAGES_BASE_URI || ""
	})

	return (
		<div className="flex flex-col items-center justify-center pb-2 forced-color-adjust-none">
			<div
				style={{
					backgroundColor: "var(--vscode-editor-foreground, #ffffff)",
					opacity: 0.9,
					WebkitMaskImage: `url('${imagesBaseUri}/researcherry-logo.svg')`,
					WebkitMaskRepeat: "no-repeat",
					WebkitMaskSize: "contain",
					maskImage: `url('${imagesBaseUri}/researcherry-logo.svg')`,
					maskRepeat: "no-repeat",
					maskSize: "contain",
				}}
				className="mx-auto brightness-110">
				<img
					src={imagesBaseUri + "/researcherry-logo.svg"}
					alt="ResearcherryAI logo"
					className="h-8 opacity-0"
				/>
			</div>
			<div className="text-center mt-2 text-xs text-vscode-descriptionForeground opacity-80">
				AI-агенты для глубокого изучения клиентов и автоматизации исследований
			</div>
		</div>
	)
}

export default ResearcherryHero
