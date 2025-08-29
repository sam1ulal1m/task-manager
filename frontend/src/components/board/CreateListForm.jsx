import { useState } from 'react'
import { X } from 'lucide-react'

const CreateListForm = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim() || undefined
      })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="w-80 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter list title..."
            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
            autoFocus
          />
        </div>

        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="List description (optional)..."
            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            maxLength={500}
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add List
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateListForm
