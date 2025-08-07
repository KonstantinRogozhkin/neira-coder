import { useState } from "react"

const RooHero = () => {
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
					WebkitMaskImage: `url('${imagesBaseUri}/roo-logo.svg')`,
					WebkitMaskRepeat: "no-repeat",
					WebkitMaskSize: "contain",
					maskImage: `url('${imagesBaseUri}/roo-logo.svg')`,
					maskRepeat: "no-repeat",
					maskSize: "contain",
				}}
				className="mx-auto brightness-110">
				<img src={imagesBaseUri + "/roo-logo.svg"} alt="Roo logo" className="h-8 opacity-0" />
			</div>
			<div className="text-center mt-2 text-xs text-vscode-descriptionForeground opacity-80">
				Мультиролевой ИИ для автоматизации рутинных бизнес-задач
			</div>
		</div>
	)
}

export default RooHero
