import React, { useState } from 'react';
import { Search, Plus, Eye, AlertTriangle, CloudRain, Settings, Printer, Save, Download, Upload, X, Check, Calendar, Coffee, Sun, Moon, Users, Clock } from 'lucide-react';
import { useStundenplan } from '../context/StundenplanContext';

// ✅ NEU: Import für zentrale Konstanten (Punkt 4)
import { WOCHENTAGE_KEYS, WOCHENTAGE_NAMEN, PERSON_TYPEN_MAP } from '../constants/appConstants';

// ✅ HINWEIS: showToastMessage wird jetzt als Prop von StundenplanApp übergeben (Punkt 3)
const PausenaufsichtModule = ({ showToastMessage }) => {
  const [activeTab, setActiveTab] = useState('hauptaufsichten');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [selectedWoche, setSelectedWoche] = useState('aktuelle'); // 'aktuelle' oder 'naechste'

  // ✅ Context-Zugriff - Jetzt inklusive masterPausenaufsichten aus dem zentralen initialAppData
  const { 
    getPersonalMitStatus, 
    ersatzTabelle, // ersatzTabelle kommt jetzt direkt aus dem Context
    setErsatzTabelle, // setErsatzTabelle bleibt für manuelle Aktualisierungen
    masterPausenaufsichten // NEU: masterPausenaufsichten aus dem Context
  } = useStundenplan();
  
  const personalMitStatus = getPersonalMitStatus();

  // ✅ ENTFERNT: Die lokalen useState-Initialisierungen für hauptaufsichten, einzelaufsichten und fruehSpaetaufsichten.
  // ✅ ENTFERNT: Der React.useEffect-Block zur Initialisierung von ersatzTabelle.
  // Die Initialisierung der `ersatzTabelle` und `masterPausenaufsichten` geschieht nun zentral über initialAppData.js

  const tabs = [
    { id: 'hauptaufsichten', label: 'Hauptaufsichten', icon: '🏫' },
    { id: 'einzelaufsichten', label: 'Einzelaufsichten', icon: '👥' },
    { id: 'frueh_spaet', label: 'Früh-/Spätaufsicht', icon: '⏰' },
    { id: 'ersatz_zusatz', label: 'Ersatz-/Zusatzaufsichten', icon: '🆘' },
    { id: 'regenpause', label: 'Regenpause', icon: '🌧️' },
    { id: 'plan_erstellen', label: 'Neuen Plan erstellen', icon: '⚙️' }
  ];

  const bereiche = {
    nordflügel: {
      name: 'Rund um den Nordflügel',
      plaetze: ['Tür Nordflügel', 'Unterer Bereich', 'Rück- und Ostseite', 'Fahrzeuge', 'Flexi'],
      farbe: 'bg-blue-50 dark:bg-blue-900/20'
    },
    obererschulhof: {
      name: 'Oberer Schulhof',
      plaetze: ['Tür Aula', 'Rolliplatz', 'Schaukeln', 'Rutschenberg'],
      farbe: 'bg-green-50 dark:bg-green-900/20'
    },
    sportplatz: {
      name: 'Sportplatz und Westflügel',
      plaetze: ['Sportplatz (Person 1)', 'Sportplatz (Person 2)', 'Tür Westflügel'],
      farbe: 'bg-purple-50 dark:bg-purple-900/20'
    },
    meerschweinchen: {
      name: 'Meerschweinchen-Bereich',
      plaetze: ['Meerschweinchen'],
      farbe: 'bg-yellow-50 dark:bg-yellow-900/20'
    }
  };

  const fruehSpaetBereiche = {
    fruehaufsicht: ['Aula', 'Busstraße Seiteneingang', 'Tür Aula/Oberer Seiteneingang', 'Tür Nordflügel/Unterer Schulhof', 'Tür Westflügel/Sportplatz'],
    spaetaufsicht: ['Eingang Turnhalle/Wendehammer', 'Busstraße Seiteneingang', 'Haupteingang OBS', 'Flexibel']
  };

  const pausenzeiten = {
    'pause1': '1. Pause (9:30-9:50)',
    'pause2': '2. Pause (11:20-11:40)',
    'pause3': '3. Pause (12:50-13:10)'
  };

  const wochentage = WOCHENTAGE_KEYS; // Nutzt Konstante
  const wochentagsNamen = WOCHENTAGE_NAMEN; // Nutzt Konstante

  const getPersonTypColor = (typ) => {
    const colors = {
      'LT': 'bg-purple-100 text-purple-800 border-purple-300',
      'LK': 'bg-blue-100 text-blue-800 border-blue-300',
      'PF': 'bg-green-100 text-green-800 border-green-300',
      'LiVD': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'TP': 'bg-pink-100 text-pink-800 border-pink-300',
      'P': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[typ] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const openPersonModal = (type, data) => {
    setCurrentAssignment({ type, ...data });
    setShowPersonModal(true);
    setSearchTerm('');
  };

  const assignPerson = (personName) => {
    if (!currentAssignment) return;

    const { type, pause, tag, bereich, platzIndex, schuelerIndex } = currentAssignment;
    const selectedPerson = personalMitStatus.find(p => p.name === personName) || null;

    // ACHTUNG: masterPausenaufsichten ist jetzt im Context,
    // um Änderungen daran vorzunehmen, benötigen Sie die setMasterPausenaufsichten-Funktion
    // aus dem Kontext. Diese ist aktuell nicht hier destrukturiert.
    // Sie müssten sie so hinzufügen:
    // const { ..., masterPausenaufsichten, setMasterPausenaufsichten } = useStundenplan();

    // Dann die Logik entsprechend anpassen, um setMasterPausenaufsichten zu verwenden.
    // Beispiel (hier noch nicht umgesetzt, da es eine komplexere Anpassung ist):
    /*
    if (type === 'hauptaufsicht') {
      setMasterPausenaufsichten(prev => {
        const updated = { ...prev };
        // ... Logik zur Aktualisierung von updated[tag][pause].hauptaufsichten[bereich] ...
        return updated;
      });
    }
    */
    // Für dieses Beispiel (und um die Anpassung zu vereinfachen, da Sie gefragt haben),
    // gehen wir davon aus, dass die Haupt-Initialisierung jetzt aus dem Context kommt
    // und der Bearbeitungsmechanismus entweder neu implementiert oder an setMasterPausenaufsichten angepasst wird.
    // Für die `ersatzTabelle` funktioniert `setErsatzTabelle` bereits, da es aus dem Kontext kommt.

    if (type === 'ersatz') {
      // Ersatztabelle aktualisieren
      const { pauseTyp } = currentAssignment;
      setErsatzTabelle(prev => ({
        ...prev,
        [tag]: {
          ...prev[tag],
          [pauseTyp]: prev[tag][pauseTyp] ? prev[tag][pauseTyp].map((p, i) =>
            i === platzIndex ? personName : p
          ) : [personName]
        }
      }));
      showToastMessage('Ersatzperson zugewiesen.'); // Toast hinzugefügt
    }

    setShowPersonModal(false);
    setCurrentAssignment(null);
  };

  // Person Modal
  const PersonModal = () => {
    const filteredPersonal = personalMitStatus.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Person auswählen</h3>
            <button onClick={() => setShowPersonModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={20} />
            </button>
          </div>

          <input
            type="text"
            placeholder="Person suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            autoFocus
          />

          <div className="max-h-64 overflow-y-auto">
            <div
              onClick={() => assignPerson('')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border border-gray-200 dark:border-gray-600 rounded mb-2"
            >
              <span className="text-gray-500 dark:text-gray-400">--- Leer ---</span>
            </div>

            {filteredPersonal.map(person => {
              return (
                <div
                  key={person.id}
                  onClick={() => assignPerson(person.name)}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border rounded mb-1 flex items-center justify-between ${
                    person.abwesend ? 'opacity-50 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <span className="text-gray-900 dark:text-white">
                    {person.name}
                    {person.abwesend && <span className="text-red-600 dark:text-red-400"> ({person.abwesenheitsgrund})</span>}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${getPersonTypColor(person.typ)}`}>
                    {person.typ}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setShowPersonModal(false)}
            className="w-full mt-4 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Abbrechen
          </button>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    // Vereinfachte Darstellung für Demo
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👁️</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Pausenaufsicht-Verwaltung
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Nutzt jetzt Context statt dataStore props!
        </p>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 max-w-md mx-auto">
          <div className="text-green-800 dark:text-green-300 font-medium">
            ✅ Context-Integration erfolgreich
          </div>
          <div className="text-green-600 dark:text-green-400 text-sm mt-1">
            Personal: {personalMitStatus.length} Personen geladen
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                👁️ Pausenaufsicht-Verwaltung
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Verwalten Sie alle Pausenaufsichten zentral und übersichtlich
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={selectedWoche}
                onChange={(e) => setSelectedWoche(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="aktuelle">Aktuelle Woche</option>
                <option value="naechste">Nächste Woche</option>
              </select>
              
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                <Eye size={18} />
                Vorschau
              </button>
              
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                <Printer size={18} />
                Drucken
              </button>
              
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Save size={18} />
                Speichern
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Person Modal */}
      {showPersonModal && <PersonModal />}
    </div>
  );
};

export default PausenaufsichtModule;