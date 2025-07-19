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

const StundenplanApp = () => {
  const [activeModule, setActiveModule] = useState('uebersicht');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Thomas Mueller ist heute krank', type: 'warning', time: '08:15' },
    { id: 2, text: '3 Vertretungen für heute geplant', type: 'info', time: '07:30' }
  ]);

  // ✅ INITIALE DATEN für Context (inkl. Inklusion)
  const initialData = {
    personal: [
      { id: 1, name: 'Anna Schmidt', typ: 'LK', email: 'a.schmidt@schule.de', standorte: ['OBS'], wochenstunden: 25, aktiv: true },
      { id: 2, name: 'Thomas Mueller', typ: 'LT', email: 't.mueller@schule.de', standorte: ['OBS'], wochenstunden: 20, aktiv: true },
      { id: 3, name: 'Sarah Weber', typ: 'PF', email: 's.weber@schule.de', standorte: ['OBS', 'Bürgerstraße'], wochenstunden: 39, aktiv: true },
      { id: 4, name: 'Michael Klein', typ: 'LiVD', email: 'm.klein@schule.de', standorte: ['OBS'], wochenstunden: 22, aktiv: true },
      { id: 5, name: 'Lisa Wagner', typ: 'TP', email: 'l.wagner@schule.de', standorte: ['OBS', 'Sidonienstraße'], wochenstunden: 35, aktiv: true },
      { id: 6, name: 'Peter Hoffmann', typ: 'LK', email: 'p.hoffmann@schule.de', standorte: ['OBS'], wochenstunden: 25, aktiv: true },
      { id: 7, name: 'Jana Fischer', typ: 'PF', email: 'j.fischer@schule.de', standorte: ['OBS'], wochenstunden: 30, aktiv: true },
      { id: 8, name: 'Markus Bauer', typ: 'P', email: 'm.bauer@schule.de', standorte: ['OBS'], wochenstunden: 20, aktiv: true },
      { id: 9, name: 'Claudia Neumann', typ: 'LT', email: 'c.neumann@schule.de', standorte: ['OBS'], wochenstunden: 25, aktiv: true },
      { id: 10, name: 'Andreas Wolf', typ: 'LK', email: 'a.wolf@schule.de', standorte: ['OBS'], wochenstunden: 25, aktiv: true },
      { id: 11, name: 'Sabine Müller', typ: 'PF', email: 's.mueller@schule.de', standorte: ['OBS'], wochenstunden: 30, aktiv: true },
      { id: 12, name: 'Frank Richter', typ: 'LK', email: 'f.richter@schule.de', standorte: ['OBS'], wochenstunden: 25, aktiv: false }
    ],
    
    personalAbwesenheiten: [
      {
        id: 1,
        personId: 3, // Sarah Weber
        person: 'Sarah Weber',
        typ: 'PF',
        grund: 'Krank',
        von: '2025-07-16', // ✅ Heute's Datum für sofortigen Test
        bis: '2025-07-16',
        dauer: 'Bis Tagesende',
        bemerkung: 'Grippe'
      },
      {
        id: 2,
        personId: 2, // Thomas Mueller
        person: 'Thomas Mueller',
        typ: 'LT',
        grund: 'Fortbildung',
        von: '2025-07-16', // ✅ Heute's Datum für sofortigen Test
        bis: '2025-07-16',
        dauer: 'Wenige Stunden',
        bemerkung: 'Rückkehr um 12:00'
      }
    ],
    
    klassenAbwesenheiten: [
      {
        id: 1,
        klasse: '6a',
        grund: 'Klassenfahrt',
        von: '2025-07-16',
        bis: '2025-07-17',
        bemerkung: 'Harz-Exkursion'
      }
    ],
    
    masterStundenplaene: {
      '1a': {
        'montag': {
          '08:00-08:45': [1], // Anna Schmidt
          '08:45-09:30': [2], // Thomas Mueller
          '09:50-10:35': [3], // Sarah Weber
          '10:35-11:20': [1], // Anna Schmidt
          '11:40-12:50': [8]  // Markus Bauer
        },
        'dienstag': {
          '08:00-08:45': [2], // Thomas Mueller
          '08:45-09:30': [3], // Sarah Weber
          '09:50-10:35': [1], // Anna Schmidt
          '11:40-12:50': [9]  // Claudia Neumann
        },
        'mittwoch': {
          '08:00-08:45': [1], // Anna Schmidt
          '09:50-10:35': [4], // Michael Klein
          '11:40-12:50': [5]  // Lisa Wagner
        },
        'donnerstag': {
          '08:00-08:45': [3], // Sarah Weber
          '08:45-09:30': [1], // Anna Schmidt
          '09:50-10:35': [2]  // Thomas Mueller
        },
        'freitag': {
          '08:00-08:45': [4], // Michael Klein
          '08:45-09:30': [5]  // Lisa Wagner
        }
      },
      '2a': {
        'montag': {
          '08:00-08:45': [6], // Peter Hoffmann
          '08:45-09:30': [7], // Jana Fischer
          '09:50-10:35': [6], // Peter Hoffmann
          '11:40-12:50': [7]  // Jana Fischer
        },
        'dienstag': {
          '08:00-08:45': [7], // Jana Fischer
          '08:45-09:30': [6], // Peter Hoffmann
          '09:50-10:35': [11] // Sabine Müller
        }
      }
    },
    
    masterPausenaufsichten: {
      'montag': {
        fruehaufsicht: {
          'Aula': 1, // Anna Schmidt
          'Busstraße Seiteneingang': 8, // Markus Bauer
          'Tür Aula/Oberer Seiteneingang': 9, // Claudia Neumann
          'Tür Nordflügel/Unterer Schulhof': 10, // Andreas Wolf
          'Tür Westflügel/Sportplatz': 11 // Sabine Müller
        },
        pause1: {
          hauptaufsichten: {
            nordflügel: {
              'Tür Nordflügel': 1, // Anna Schmidt
              'Unterer Bereich': 8, // Markus Bauer
              'Rück- und Ostseite': 9, // Claudia Neumann
              'Fahrzeuge': 10, // Andreas Wolf
              'Flexi': 11 // Sabine Müller
            },
            obererschulhof: {
              'Tür Aula': 12, // Frank Richter
              'Rolliplatz': 2, // Thomas Mueller
              'Schaukeln': 3, // Sarah Weber
              'Rutschenberg': 4 // Michael Klein
            }
          },
          einzelaufsichten: [
            { schueler: 'Max Mustermann (5a)', personId: 4 }, // Michael Klein
            { schueler: 'Emma Schmidt (3b)', personId: 1 } // Anna Schmidt
          ]
        }
      },
      'dienstag': {
        fruehaufsicht: {
          'Aula': 2, // Thomas Mueller
          'Busstraße Seiteneingang': 6, // Peter Hoffmann
        },
        pause1: {
          hauptaufsichten: {
            nordflügel: {
              'Tür Nordflügel': 11, // Sabine Müller
              'Unterer Bereich': 2, // Thomas Mueller
              'Rück- und Ostseite': 1, // Anna Schmidt
            }
          },
          einzelaufsichten: []
        }
      }
    },
    
    vertretungen: {}, // ✅ Für persistente Vertretungen
    
    ersatzTabelle: {
      'Montag': {
        pause1: ['Andreas Wolf', 'Claudia Neumann', 'Frank Richter'],
        pause2: ['Peter Hoffmann', 'Sarah Weber', 'Markus Bauer'],
        pause3: ['Lisa Wagner', 'Jana Fischer', 'Michael Klein'],
        fruehaufsicht: ['Sabine Müller', 'Thomas Mueller'],
        spaetaufsicht: ['Anna Schmidt', 'Peter Hoffmann']
      },
      'Dienstag': {
        pause1: ['Sabine Müller', 'Thomas Mueller', 'Anna Schmidt'],
        pause2: ['Frank Richter', 'Markus Bauer', 'Andreas Wolf'],
        pause3: ['Claudia Neumann', 'Peter Hoffmann', 'Lisa Wagner'],
        fruehaufsicht: ['Jana Fischer', 'Michael Klein'],
        spaetaufsicht: ['Sarah Weber', 'Frank Richter']
      }
    },

    // ✅ NEU: INKLUSIONS-DATEN
    inklusionsSchulen: [
      {
        id: 1,
        name: 'Grundschule Am Park',
        adresse: 'Parkstraße 15, 38100 Braunschweig',
        telefon: '0531-12345',
        email: 'info@gs-park.de',
        ansprechpartner: 'Frau Müller',
        schulform: 'Grundschule'
      },
      {
        id: 2,
        name: 'Realschule Nord',
        adresse: 'Nordring 8, 38102 Braunschweig',
        telefon: '0531-67890',
        email: 'verwaltung@rs-nord.de',
        ansprechpartner: 'Herr Schmidt',
        schulform: 'Realschule'
      },
      {
        id: 3,
        name: 'IGS Franzsches Feld',
        adresse: 'Franzsches Feld 5, 38104 Braunschweig',
        telefon: '0531-11111',
        email: 'sekretariat@igs-ff.de',
        ansprechpartner: 'Herr Dr. Weber',
        schulform: 'Gesamtschule'
      }
    ],
    
    inklusionsSchueler: [
      {
        id: 1,
        name: 'Max Mustermann',
        klasse: '3a',
        schuleId: 1,
        geburtsdatum: '2015-03-15',
        foerderschwerpunkt: 'Geistige Entwicklung',
        bemerkungen: 'Benötigt ruhige Umgebung, sehr hilfsbereit'
      },
      {
        id: 2,
        name: 'Lisa Schmidt',
        klasse: '7b',
        schuleId: 2,
        geburtsdatum: '2012-08-22',
        foerderschwerpunkt: 'Lernen',
        bemerkungen: 'Schwerpunkt Mathematik und Deutsch'
      },
      {
        id: 3,
        name: 'Tom Richter',
        klasse: '5c',
        schuleId: 3,
        geburtsdatum: '2013-11-08',
        foerderschwerpunkt: 'Emotionale und soziale Entwicklung',
        bemerkungen: 'Kleine Lerngruppen bevorzugt'
      }
    ],
    
    inklusionsBetreuungen: {
      '3_1': { // PersonId_SchuelerId (Sarah Weber - Max Mustermann)
        personId: 3, // Sarah Weber
        schuelerId: 1, // Max Mustermann
        wochenstunden: 8,
        zeiten: {
          montag: ['08:00-10:00'],
          dienstag: [],
          mittwoch: ['09:00-11:00'],
          donnerstag: ['08:00-10:00'],
          freitag: ['08:00-10:00']
        },
        notizen: 'Fokus auf Selbstständigkeit und Kommunikation'
      },
      '12_2': { // Frank Richter - Lisa Schmidt
        personId: 12,
        schuelerId: 2,
        wochenstunden: 6,
        zeiten: {
          montag: ['10:00-12:00'],
          dienstag: ['09:00-11:00'],
          mittwoch: [],
          donnerstag: ['10:00-12:00'],
          freitag: []
        },
        notizen: 'Therapiebegleitung Mathematik'
      },
      '5_3': { // Lisa Wagner - Tom Richter
        personId: 5,
        schuelerId: 3,
        wochenstunden: 4,
        zeiten: {
          montag: [],
          dienstag: ['13:00-15:00'],
          mittwoch: [],
          donnerstag: ['13:00-15:00'],
          freitag: []
        },
        notizen: 'Sozialtraining und Konfliktlösung'
      }
    }
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
    <StundenplanProvider initialData={initialData}>
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
                  Context-System + Inklusion aktiv
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
              <CurrentComponent />
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
    </StundenplanProvider>
  );
};

export default StundenplanApp;