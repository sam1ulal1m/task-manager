import { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { 
  User, 
  Mail, 
  Lock, 
  Camera,
  Save,
  X,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Moon,
  Sun,
  Globe,
  Trash2
} from 'lucide-react'
import { updateProfile, changePassword, deleteAccount } from '../store/slices/authSlice'
import { setTheme, updateNotificationSettings } from '../store/slices/uiSlice'
import LoadingSpinner from '../components/LoadingSpinner'

const Profile = () => {
  const dispatch = useDispatch()
  const { user, isLoading } = useSelector(state => state.auth)
  const { theme, notificationSettings } = useSelector(state => state.ui)
  const [activeTab, setActiveTab] = useState('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const fileInputRef = useRef(null)

  const profileForm = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || ''
    }
  })

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const handleProfileUpdate = async (data) => {
    try {
      await dispatch(updateProfile(data)).unwrap()
      // Show success message
    } catch (error) {
      console.error('Profile update failed:', error)
    }
  }

  const handlePasswordChange = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      })
      return
    }

    try {
      await dispatch(changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })).unwrap()
      passwordForm.reset()
      // Show success message
    } catch (error) {
      passwordForm.setError('currentPassword', {
        type: 'manual',
        message: error.message || 'Password change failed'
      })
    }
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Handle avatar upload
      const formData = new FormData()
      formData.append('avatar', file)
      dispatch(updateProfile(formData))
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )
    
    if (confirmed) {
      const doubleConfirmed = window.confirm(
        'This will permanently delete all your data, boards, and teams. Are you absolutely sure?'
      )
      
      if (doubleConfirmed) {
        try {
          await dispatch(deleteAccount()).unwrap()
          // Redirect will be handled by the auth slice
        } catch (error) {
          console.error('Account deletion failed:', error)
        }
      }
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'account', name: 'Account', icon: Shield },
    { id: 'preferences', name: 'Preferences', icon: Bell },
    { id: 'security', name: 'Security', icon: Lock }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Profile Information
                </h2>
                
                <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={32} className="text-gray-600" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                      >
                        <Camera size={16} />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Profile Photo
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Click the camera icon to update your profile photo
                      </p>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      {...profileForm.register('name', { required: 'Name is required' })}
                      type="text"
                      className="input"
                      placeholder="Enter your full name"
                    />
                    {profileForm.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      {...profileForm.register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="input"
                      placeholder="Enter your email"
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      {...profileForm.register('bio')}
                      rows={4}
                      className="input"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      {...profileForm.register('location')}
                      type="text"
                      className="input"
                      placeholder="City, Country"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <input
                      {...profileForm.register('website')}
                      type="url"
                      className="input"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="small" />
                      ) : (
                        <Save size={16} />
                      )}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'account' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Account Information
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Account Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                        <span className="text-gray-900 dark:text-white font-mono">{user?._id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Member since:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(user?.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Last updated:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(user?.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h3 className="font-medium text-red-900 dark:text-red-300 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 size={16} />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Preferences
                </h2>
                
                <div className="space-y-6">
                  {/* Theme */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Theme</h3>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => dispatch(setTheme('light'))}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                          theme === 'light'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Sun size={16} />
                        <span>Light</span>
                      </button>
                      <button
                        onClick={() => dispatch(setTheme('dark'))}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Moon size={16} />
                        <span>Dark</span>
                      </button>
                      <button
                        onClick={() => dispatch(setTheme('system'))}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                          theme === 'system'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Globe size={16} />
                        <span>System</span>
                      </button>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Notifications</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'email', label: 'Email notifications' },
                        { key: 'push', label: 'Push notifications' },
                        { key: 'boardUpdates', label: 'Board updates' },
                        { key: 'teamInvites', label: 'Team invitations' },
                        { key: 'cardAssignments', label: 'Card assignments' },
                        { key: 'dueDates', label: 'Due date reminders' }
                      ].map((setting) => (
                        <label key={setting.key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={notificationSettings?.[setting.key] || false}
                            onChange={(e) => dispatch(updateNotificationSettings({
                              [setting.key]: e.target.checked
                            }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                            {setting.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Security Settings
                </h2>
                
                <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        {...passwordForm.register('currentPassword', { required: 'Current password is required' })}
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="input pr-10"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        {...passwordForm.register('newPassword', { 
                          required: 'New password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        })}
                        type={showNewPassword ? 'text' : 'password'}
                        className="input pr-10"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        {...passwordForm.register('confirmPassword', { required: 'Please confirm your password' })}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="input pr-10"
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="small" />
                      ) : (
                        <Lock size={16} />
                      )}
                      <span>Change Password</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
