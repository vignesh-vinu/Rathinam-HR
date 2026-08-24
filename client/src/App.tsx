import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { NotificationDrawer } from './components/NotificationDrawer';

import { LandingPage } from './pages/public/LandingPage';
import { ApplicationFormPage } from './pages/public/ApplicationFormPage';
import { SuccessPage } from './pages/public/SuccessPage';
import { TrackApplicationPage } from './pages/public/TrackApplicationPage';

import { HRLoginPage } from './pages/admin/HRLoginPage';
import { HRDashboardPage } from './pages/admin/HRDashboardPage';
import { ApplicantProfilePage } from './pages/admin/ApplicantProfilePage';
import { PDFFieldMapperPage } from './pages/admin/PDFFieldMapperPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

import { OrganizationId } from './types';
import { OrgCards } from './components/OrgCards';

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  
  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewParams, setViewParams] = useState<any>({});
  const [selectedOrg, setSelectedOrg] = useState<OrganizationId>('RGU');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navigateTo = (view: string, param?: any) => {
    setCurrentView(view);
    if (param) {
      setViewParams(param);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOrgToApply = (orgId: OrganizationId) => {
    setSelectedOrg(orgId);
    navigateTo('apply-form');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Top Header Navbar */}
      <Navbar 
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage 
            onNavigate={navigateTo}
            onSelectOrg={handleSelectOrgToApply}
          />
        )}

        {currentView === 'apply-selector' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <OrgCards onSelectOrg={handleSelectOrgToApply} />
          </div>
        )}

        {currentView === 'apply-form' && (
          <ApplicationFormPage
            organizationId={selectedOrg}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'success' && (
          <SuccessPage
            applicationId={viewParams.applicationId || 'RHR-2026-000001'}
            application={viewParams.application}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'track' && (
          <TrackApplicationPage
            initialAppId={viewParams.searchId}
            onNavigate={navigateTo}
          />
        )}

        {/* HR ADMIN VIEWS - PROTECTED ROUTES */}
        {currentView === 'admin-login' && (
          <HRLoginPage onNavigate={navigateTo} />
        )}

        {currentView === 'admin-dashboard' && (
          user ? (
            <HRDashboardPage onNavigate={navigateTo} />
          ) : (
            <HRLoginPage onNavigate={navigateTo} />
          )
        )}

        {currentView === 'applicant-profile' && (
          user ? (
            <ApplicantProfilePage
              applicationId={viewParams.id}
              onNavigate={navigateTo}
            />
          ) : (
            <HRLoginPage onNavigate={navigateTo} />
          )
        )}

        {currentView === 'field-mapper' && (
          user ? (
            <PDFFieldMapperPage onNavigate={navigateTo} />
          ) : (
            <HRLoginPage onNavigate={navigateTo} />
          )
        )}

        {currentView === 'audit-logs' && (
          user ? (
            <AuditLogsPage onNavigate={navigateTo} />
          ) : (
            <HRLoginPage onNavigate={navigateTo} />
          )
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onSelectApplication={(appId) => {
          navigateTo('applicant-profile', { id: appId });
        }}
      />

    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
