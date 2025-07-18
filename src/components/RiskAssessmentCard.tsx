
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';

interface RiskAssessment {
  level: 'low' | 'medium' | 'high' | 'severe';
  message: string;
  recommendation: string;
  source: string;
}

interface RiskAssessmentCardProps {
  assessment: RiskAssessment | null;
}

const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({ assessment }) => {
  if (!assessment) {
    return (
      <Card className="mb-6 p-4">
        <CardHeader>
          <CardTitle>Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading risk assessment...</p>
        </CardContent>
      </Card>
    );
  }

  const getRiskUI = (level: RiskAssessment['level']) => {
    switch (level) {
      case 'severe':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
          color: 'border-red-500 bg-red-50',
          title: 'Severe Risk',
        };
      case 'high':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-orange-500" />,
          color: 'border-orange-500 bg-orange-50',
          title: 'High Risk',
        };
      case 'medium':
        return {
          icon: <Shield className="w-8 h-8 text-yellow-500" />,
          color: 'border-yellow-500 bg-yellow-50',
          title: 'Medium Risk',
        };
      default:
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          color: 'border-green-500 bg-green-50',
          title: 'Low Risk',
        };
    }
  };

  const { icon, color, title } = getRiskUI(assessment.level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <Card className={`mb-6 border-2 ${color}`}>
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          {icon}
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-semibold">{assessment.message}</p>
          <p className="text-sm text-gray-600 mt-2">{assessment.recommendation}</p>
          <p className="text-xs text-gray-400 mt-4">Source: {assessment.source}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RiskAssessmentCard;
