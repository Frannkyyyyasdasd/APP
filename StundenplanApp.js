import React, { useState } from 'react';
import {
  Calendar, Users, Clock, UserX, Heart, GraduationCap, Eye,
  Menu, X, Sun, Moon, Bell, Settings, HelpCircle,
  Home, Search, Plus, Download, Upload, Save, MapPin, Mail, FileText, AlertTriangle, CheckCircle, Send, Coffee
} from 'lucide-react';

// ✅ CONTEXT IMPORT
import { StundenplanProvider } from './context/StundenplanContext';

// ✅ MODULE IMPORTS (KORRIGIERT)
import PersonalModule from './modules/PersonalModule';
import StundenplanungModule from './modules/StundenplanungModule';
import PausenaufsichtModule from './modules/PausenaufsichtModule';
import InklusionModule from './modules/InklusionModule';
import KlassenModule from './modules/KlassenModule';
import UebersichtModule from './modules/UebersichtModule';
import AbwesenheitenModule from './modules/AbwesenheitenModule';

// ✅ KORRIGIERT: Import-Pfad ohne './data/' da die Datei direkt im src-Verzeichnis liegt
import initialAppData from './initialAppData';

const StundenplanApp = () => {
  const [activeModule, setActiveModule] = useState('uebersicht');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Thomas Mueller ist heute krank', type: 'warning', time: '08:15' },
    { id: 2, text: '3 Vertretungen für heute geplant', type: 'info', time: '07:30' }
  ]);

  // ✅ HINZUGEFÜGT: State für globale Toast-Nachrichten
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ✅ NEU: Funktion zum Anzeigen globaler Toast-Nachrichten
  const showGlobalToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    // Toast nach 3 Sekunden automatisch ausblenden
    setTimeout(() => setShowToast(false), 3000);
  };

  const modules = [
    {
      id: 'uebersicht',
      name: 'Tagesübersicht',
      icon: Home,
      component: UebersichtModule,
      description: 'Zentrale Übersicht des aktuellen Tages',
      color: 'blue',
      badge: null
    },
    {
      id: 'abwesenheiten',
      name: 'Abwesenheiten',
      icon: UserX,
      component: AbwesenheitenModule,
      description: 'Abwesenheiten von Personal und Klassen',
      color: 'red',
      badge: null
    },
    {
      id: 'personal',
      name: 'Personal',
      icon: Users,
      component: PersonalModule,
      description: 'Personalverwaltung und Stundenpläne',
      color: 'green'
    },
    {
      id: 'stundenplanung',
      name: 'Stundenplanung',
      icon: Calendar,
      component: StundenplanungModule,
      description: 'Master-Stundenplan-Erstellung',
      color: 'purple'
    },
    {
      id: 'pausenaufsicht',
      name: 'Pausenaufsicht',
      icon: Eye,
      component: PausenaufsichtModule,
      description: 'Master-Pausenaufsichten verwalten',
      color: 'orange'
    },
    {
      id: 'klassen',
      name: 'Klassen',
      icon: GraduationCap,
      component: KlassenModule,
      description: 'Klassenverwaltung und Zuordnungen',
      color: 'indigo'
    },
    {
      id: 'inklusion',
      name: 'Inklusion',
      icon: Heart,
      component: InklusionModule,
      description: 'Sonderpädagogische Grundversorgung',
      color: 'pink'
    }
  ];

  const getColorClasses = (color, variant = 'default') => {
    const colors = {
      default: 'text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200',
      active: 'text-white bg-blue-600 shadow-lg border-blue-600'
    };
    return colors[variant] || colors.default;
  };

  const currentModule = modules.find(m => m.id === activeModule);
  const CurrentComponent = currentModule?.component;

  return (
    <StundenplanProvider initialData={initialAppData}>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-16'} flex flex-col border-r border-gray-200`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div>
                  <h1 className="text-xl font-bold text-gray-800">🏫 Stundenplan</h1>
                  <p className="text-xs text-gray-500 mt-1">Master-Plan System v2.0 + Inklusion</p>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {modules.map((module) => {
                const Icon = module.icon;
                const isActive = activeModule === module.id;
                
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className={`${sidebarOpen ? 'w-full' : 'w-12 mx-2'} flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center'} py-4 rounded-xl transition-all duration-200 relative text-left ${
                      isActive
                        ? getColorClasses(module.color, 'active')
                        : getColorClasses(module.color, 'default')
                    }`}
                    title={!sidebarOpen ? module.name : ''}
                  >
                    <Icon size={22} className="flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium">{module.name}</div>
                          <div className="text-xs opacity-75">{module.description}</div>
                        </div>
                        {module.badge && module.badge > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center flex-shrink-0">
                            {module.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          {sidebarOpen && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Context-System + Inklusion bereit
                </div>
                <div>Letzte Synchronisation: {new Date().toLocaleTimeString('de-DE')}</div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentModule?.name || 'Unbekanntes Modul'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date().toLocaleDateString('de-DE', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {notifications.length > 0 && (
                  <div className="relative">
                    <button className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors">
                      <Bell size={20} />
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {notifications.length}
                      </span>
                    </button>
                  </div>
                )}
                
                <div className="text-sm text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Context + Inklusion bereit
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Module Content */}
          <main className="flex-1 overflow-auto bg-gray-50">
            {CurrentComponent ? (
              <CurrentComponent showToastMessage={showGlobalToastMessage} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">🤔</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Modul nicht gefunden
                  </h2>
                  <p className="text-gray-600">
                    Das gewählte Modul konnte nicht geladen werden.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ✅ NEU: Globale Toast-Komponente hier rendern */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-4 flex items-center gap-3">
            <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
            <p className="text-sm text-gray-900 dark:text-white flex-1">{toastMessage}</p>
            <button
              onClick={() => setShowToast(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </StundenplanProvider>
  );
};

export default StundenplanApp;