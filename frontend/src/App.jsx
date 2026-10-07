import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import RequestRepairPage from './pages/RequestRepairPage';
import TrackRepairPage from './pages/TrackRepairPage';
import AiAssistantPage from './pages/AiAssistantPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import RepairerLoginPage from './pages/RepairerLoginPage';
import RepairerDashboardPage from './pages/RepairerDashboardPage';
import RepairerProfilePage from './pages/RepairerProfilePage';

function AppContent() {
  const [activePage, setActivePage] = useState('landing');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [initialProblem, setInitialProblem] = useState('');

  const { isRepairer, user } = useAuth();

  const handleCategoryFromFooterOrLanding = (catName) => {
    setSelectedCategory(catName);
    setActivePage('request');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (newPage) => {
    setActivePage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      <Navbar activePage={activePage} setActivePage={handlePageChange} />

      <main className="main-content">
        {activePage === 'landing' && (
          <LandingPage
            setActivePage={handlePageChange}
            setSelectedCategory={setSelectedCategory}
            setTrackingIdInput={setTrackingIdInput}
          />
        )}

        {activePage === 'request' && (
          <RequestRepairPage
            initialCategory={selectedCategory}
            initialProblem={initialProblem}
            setActivePage={handlePageChange}
            setTrackingIdInput={setTrackingIdInput}
          />
        )}

        {activePage === 'track' && (
          <TrackRepairPage
            initialTrackingId={trackingIdInput}
            setActivePage={handlePageChange}
          />
        )}

        {activePage === 'ai' && (
          <AiAssistantPage
            setActivePage={handlePageChange}
            setInitialCategory={setSelectedCategory}
            setInitialProblem={setInitialProblem}
          />
        )}

        {activePage === 'customer-profile' && (
          <CustomerProfilePage
            setActivePage={handlePageChange}
            setTrackingIdInput={setTrackingIdInput}
          />
        )}

        {activePage === 'repairer-login' && (
          <RepairerLoginPage setActivePage={handlePageChange} />
        )}

        {activePage === 'repairer-dashboard' && (
          <RepairerDashboardPage setActivePage={handlePageChange} />
        )}

        {activePage === 'repairer-profile' && (
          <RepairerProfilePage setActivePage={handlePageChange} />
        )}
      </main>

      <Footer
        onCategoryClick={handleCategoryFromFooterOrLanding}
        setActivePage={handlePageChange}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
