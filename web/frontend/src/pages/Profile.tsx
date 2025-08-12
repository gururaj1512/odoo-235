import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Camera, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  Shield,
  Building2,
  Settings
} from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import { updateProfile } from '@/redux/slices/authSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'Admin':
        return <Shield className="w-5 h-5 text-red-500" />;
      case 'Owner':
        return <Building2 className="w-5 h-5 text-blue-500" />;
      default:
        return <User className="w-5 h-5 text-green-500" />;
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'Admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Owner':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'nearby-sports', label: 'Nearby Sports', icon: MapPin },
    ...(user?.role === 'Owner' ? [{ id: 'facilities', label: 'My Facilities', icon: Building2 }] : []),
    ...(user?.role === 'Admin' ? [{ id: 'admin', label: 'Admin Panel', icon: Settings }] : [])
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-qc-text">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              {/* Profile Card */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-qc-primary to-qc-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-bold text-qc-text">{user?.name}</h2>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium mt-2 ${getRoleColor()}`}>
                  {getRoleIcon()}
                  {user?.role}
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-qc-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        if (tab.id === 'nearby-sports') {
                          window.location.href = '/nearby-sports';
                        } else {
                          setActiveTab(tab.id);
                        }
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'profile' && (
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-qc-text">Profile Information</h3>
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Profile
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Avatar URL
                        </label>
                        <input
                          type="url"
                          name="avatar"
                          value={formData.avatar}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary transition-colors disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    {/* Account Info */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-qc-text mb-4">Account Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <Mail className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Email Verified</p>
                            <p className="font-medium text-qc-text">
                              {user?.isVerified ? 'Yes' : 'No'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Member Since</p>
                            <p className="font-medium text-qc-text">
                              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'bookings' && (
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-qc-text">My Bookings</h3>
                      <button
                        onClick={() => window.location.href = '/bookings'}
                        className="px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors"
                      >
                        View All Bookings
                      </button>
                    </div>
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-600 mb-2">No bookings yet</h4>
                      <p className="text-gray-500">Start booking courts to see your history here</p>
                    </div>
                  </div>
                )}

                {activeTab === 'facilities' && user?.role === 'Owner' && (
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h3 className="text-xl font-bold text-qc-text mb-6">My Facilities</h3>
                    <div className="text-center py-12">
                      <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-600 mb-2">No facilities yet</h4>
                      <p className="text-gray-500">Add your first facility to get started</p>
                    </div>
                  </div>
                )}


              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
