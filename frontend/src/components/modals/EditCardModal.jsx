import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Calendar, User, MessageCircle, Paperclip, CheckSquare, Tag, Archive, Trash2 } from 'lucide-react';
import { closeModal } from '../../store/slices/uiSlice';
import { updateCard, deleteCard } from '../../store/slices/cardsSlice';
import { toast } from 'react-hot-toast';

const EditCardModal = () => {
  const dispatch = useDispatch();
  const { modal, modalData: card } = useSelector(state => state.ui);
  const { isLoading } = useSelector(state => state.cards);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    labels: []
  });
  
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title || '',
        description: card.description || '',
        dueDate: card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '',
        priority: card.priority || 'medium',
        labels: card.labels || []
      });
    }
  }, [card]);

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Card title is required');
      return;
    }

    if (!card?._id) {
      toast.error('Card ID is missing');
      return;
    }

    try {
      const updateData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
      };

      await dispatch(updateCard({
        cardId: card._id,
        updates: updateData
      })).unwrap();

      toast.success('Card updated successfully');
      handleClose();
    } catch (error) {
      toast.error(error.message || 'Failed to update card');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      try {
        await dispatch(deleteCard(card._id)).unwrap();
        toast.success('Card deleted successfully');
        handleClose();
      } catch (error) {
        toast.error(error.message || 'Failed to delete card');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  };

  if (modal !== 'EditCard' || !card) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <CheckSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Card
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter card title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Add a more detailed description..."
                />
              </div>

              {/* Due Date and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Current Priority Display */}
              {formData.priority && (
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Priority: </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColors[formData.priority]}`}>
                    {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Card</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Card Details</h3>
            
            {/* Card Info */}
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                <div className="text-gray-900 dark:text-white">
                  {new Date(card.createdAt).toLocaleDateString()}
                </div>
              </div>

              {card.updatedAt && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                  <div className="text-gray-900 dark:text-white">
                    {new Date(card.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              )}

              {card.dueDate && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                  <div className="text-gray-900 dark:text-white">
                    {new Date(card.dueDate).toLocaleDateString()}
                  </div>
                </div>
              )}

              <div>
                <span className="text-gray-500 dark:text-gray-400">List:</span>
                <div className="text-gray-900 dark:text-white">
                  {card.list?.title || 'Unknown'}
                </div>
              </div>

              {card.position !== undefined && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Position:</span>
                  <div className="text-gray-900 dark:text-white">
                    {card.position}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCardModal;
