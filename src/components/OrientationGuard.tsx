import { useState, useEffect, ReactNode } from 'react';
import { Smartphone, RotateCw } from 'lucide-react';
import Logo from './Logo';

interface OrientationGuardProps {
  children: ReactNode;
}

const OrientationGuard = ({ children }: OrientationGuardProps) => {
  const [isPortrait, setIsPortrait] = useState(true);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if width is greater than height (landscape/wide screen)
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
    };

    // Check on mount
    checkOrientation();

    // Listen for resize/orientation changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // If in portrait mode, show the app
  if (isPortrait) {
    return <>{children}</>;
  }

  // If in landscape/wide mode, show instructions
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-6 overflow-auto">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <Smartphone className="w-20 h-20 text-blue-600" />
            <RotateCw className="w-10 h-10 text-blue-500 absolute -right-2 -bottom-2 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900">
          Portrait Mode Required
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-lg leading-relaxed">
          This app is designed for mobile devices in portrait orientation for the best experience.
        </p>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-left">
            To continue:
          </h2>
          <ol className="text-left space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              <span>
                <strong>On Mobile:</strong> Rotate your device to portrait mode (vertical)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              <span>
                <strong>On Desktop/Tablet:</strong> Resize your browser window to be taller than it is wide, you can do this by right clicking anywhere on the page, then clicking Inspect (CMD + Option + I on Mac) and then clicking the Computer/Phone icon in the top left of the appeared console
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              <span>
                Make sure auto-rotation is enabled in your device settings
              </span>
            </li>
          </ol>
        </div>

        {/* Additional info */}
        <p className="text-sm text-gray-500">
          The app will automatically load once you switch to portrait orientation
        </p>

        {/* Footer branding */}
        <div className="pt-4 border-t border-gray-200">
          {/* DisasterReady Logo */}
          <div className="flex justify-center mb-3">
            <Logo size="md" showText={true} />
          </div>
          
          <p className="text-xs text-gray-400 mb-2">
            Powered by
          </p>
          <div className="flex justify-center items-center">
            <span className="text-2xl font-bold">
              <span className="text-disaster-blue">Disaster</span>
              <span className="text-disaster-green">Ready</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Stay prepared. Stay safe.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrientationGuard;
