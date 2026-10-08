import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import TaxCalculatorPage from './pages/TaxCalculatorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';
import HomePage from './pages/HomePage';
import MonthlyTrackerPage from './pages/MonthlyTrackerPage';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Layout wrapper with responsive Mobile Drawer support
const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [prevPath, setPrevPath] = useState(location.pathname);

  // ปิด Drawer อัตโนมัติเมื่อมีการเปลี่ยนเส้นทาง (Route Change) ตามแบบแผน React 19
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setIsSidebarOpen(false);
  }

  return (
    <div className="app-layout">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <div className="main-content">
        <Topbar 
          onToggleMenu={() => setIsSidebarOpen(prev => !prev)} 
          isMenuOpen={isSidebarOpen} 
        />
        <main className="page-body">
          {children}
        </main>
        <footer className="app-footer">
          <div className="footer-content">
            <span>TaxMe • คำนวณภาษีง่าย ๆ วางแผนการเงินได้ดีกว่าเดิม</span>
            <span className="footer-update">อัปเดตล่าสุด: 2569</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/" element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          } />
          
          <Route path="/calculator" element={
            <AppLayout>
              <TaxCalculatorPage />
            </AppLayout>
          } />

          <Route path="/monthly-tracker" element={
            <AppLayout>
              <MonthlyTrackerPage />
            </AppLayout>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/history" element={
            <ProtectedRoute>
              <AppLayout>
                <HistoryPage />
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
