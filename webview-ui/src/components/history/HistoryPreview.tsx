import { memo, useState } from "react"

import { vscode } from "@src/utils/vscode"
import { useAppTranslation } from "@src/i18n/TranslationContext"

import { useTaskSearch } from "./useTaskSearch"
import TaskItem from "./TaskItem"
import { DeleteTaskDialog } from "./DeleteTaskDialog"

const HistoryPreview = () => {
	const { tasks } = useTaskSearch()
	const { t } = useAppTranslation()
	const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)

	const handleViewAllHistory = () => {
		vscode.postMessage({ type: "switchTab", tab: "history" })
	}

	return (
		<div className="flex flex-col gap-3">
			{tasks.length !== 0 && (
				<>
					{tasks.slice(0, 3).map((item) => (
						<TaskItem key={item.id} item={item} variant="compact" onDelete={setDeleteTaskId} />
					))}
					<button
						onClick={handleViewAllHistory}
						className="text-base text-vscode-descriptionForeground hover:text-vscode-textLink-foreground transition-colors cursor-pointer text-center w-full"
						aria-label={t("history:viewAllHistory")}>
						{t("history:viewAllHistory")}
					</button>
				</>
			)}

			{/* Delete dialog */}
			{deleteTaskId && (
				<DeleteTaskDialog taskId={deleteTaskId} onOpenChange={(open) => !open && setDeleteTaskId(null)} open />
			)}
		</div>
	)
}

export default memo(HistoryPreview)
