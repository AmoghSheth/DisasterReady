
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

// Redirecting from the index page to the welcome page
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
