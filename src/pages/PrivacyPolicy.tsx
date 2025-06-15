import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div 
        className="bg-white px-5 py-4 shadow-sm flex items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mr-3 p-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
      </motion.div>
      
      <motion.div 
        className="px-5 py-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed">
              DisasterReady collects information you provide directly to us, such as when you create an account, 
              set up your household information, add emergency contacts, or use our location services. This may include 
              your name, email address, phone number, location data, household size, and emergency contact information.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="text-gray-600 space-y-2 ml-4">
              <li>• Provide emergency alerts and notifications for your area</li>
              <li>• Help you create and maintain emergency preparedness plans</li>
              <li>• Show relevant emergency shelters and resources near you</li>
              <li>• Improve our services and develop new features</li>
              <li>• Communicate with you about important safety information</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Location Information</h2>
            <p className="text-gray-600 leading-relaxed">
              We collect location information to provide you with relevant emergency alerts and nearby resources. 
              You can control location sharing through your device settings and our app preferences. Location data 
              is only used to enhance emergency preparedness and response capabilities.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your 
              consent, except as described in this policy. We may share information with emergency services or 
              authorities when necessary for public safety or as required by law.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate security measures to protect your personal information against unauthorized 
              access, alteration, disclosure, or destruction. However, no method of transmission over the Internet 
              or electronic storage is 100% secure.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              You have the right to access, update, or delete your personal information at any time through your 
              account settings. You may also opt out of certain communications or delete your account entirely 
              by contacting us.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at privacy@disasterready.app 
              or through the app's support features.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: June 2025
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;