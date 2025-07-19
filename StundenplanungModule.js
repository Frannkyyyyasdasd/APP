import React, { useState } from 'react';
import { Search, Plus, Calendar, Save, RotateCcw, Copy, Eye, X, Users, Clock, ChevronDown, ChevronUp, Trash2, Edit } from 'lucide-react';
import { useStundenplan } from '../context/StundenplanContext';

const StundenplanungModule = () => {
  const [activeTab, setActiveTab] = useState('wochenplanung');
  const [selectedKlasse, setSelectedKlasse] = useState('1a');
  const [selectedWochentag, setSelectedWochentag] = useState('montag');
  const [viewMode, setViewMode] = useState('einzelklasse'); // 'einzelklasse' oder 'uebersicht'
  const [searchTerm, setSearchTerm] = useState('');
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [showKlasseModal, setShowKlasseModal] = useState(false);
  const [selectedPersons, setSelectedPersons] = useState([]);

  // ✅ Context-Zugriff
  const { 
    getPersonalMitStatus, 
    getPersonById,
    masterStundenplaene,
    setMasterStundenplaene,
    syncPersonalStundenplaene
  } = useStundenplan();
  
  const personalMitStatus = getPersonalMitStatus();

  // ✅ Klassen-Struktur erweitert
  const klassenStruktur = [
    // Primarstufe
    { klasse: '1a', stufe: 'Primarstufe', standort: 'OBS' },
    { klasse: '1b', stufe: 'Primarstufe', standort: 'OBS' },
    { klasse: '1c', stufe: 'Primarstufe', standort: 'OBS' },
    { klasse: '1d', stufe: 'Primarstufe', standort: 'Volkmarode' },
    { klasse: '2a', stufe: 'Primarstufe', standort: 'OBS' },
    { klasse: '2b', stufe: 'Primarstufe', standort: 'OBS' },
    { klasse: '2d', stufe: 'Primarstufe', standort: 'Volkmarode' },
    { klasse: '3a', stufe: 'Primarstufe', standort: 'OBS' },
    { klasse: '3b', stufe: 'Primarstufe', standort: 'OBS' },
    { klasse: '3d', stufe: 'Primarstufe', standort: 'Bürgerstraße' },
    { klasse: '4a', stufe: 'Primarstufe', standort: 'OBS' },
    { klasse: '4b', stufe: 'Primarstufe', standort: 'OBS' },
    { klasse: '4d', stufe: 'Primarstufe', standort: 'Bürgerstraße' },
    // Sekundarstufe I
    { klasse: '5a', stufe: 'Sekundarstufe I', standort: 'OBS' },
    { klasse: '5b', stufe: 'Sekundarstufe I', standort: 'OBS' },
    { klasse: '5e', stufe: 'Sekundarstufe I', standort: 'Sidonienstraße' },
    { klasse: '6a', stufe: 'Sekundarstufe I', standort: 'Böcklinstraße' },
    { klasse: '6b', stufe: 'Sekundarstufe I', standort: 'Böcklinstraße' },
    { klasse: '6d', stufe: 'Sekundarstufe I', standort: 'Böcklinstraße' },
    { klasse: '6f', stufe: 'Sekundarstufe I', standort: 'HvF' },
    { klasse: '7a', stufe: 'Sekundarstufe I', standort: 'Sidonienstraße' },
    { klasse: '7b', stufe: 'Sekundarstufe I', standort: 'Böcklinstraße' },
    { klasse: '7c', stufe: 'Sekundarstufe I', standort: 'OBS' },
    { klasse: '8a', stufe: 'Sekundarstufe I', standort: 'OBS' },
    { klasse: '8b', stufe: 'Sekundarstufe I', standort: 'OBS' },
    { klasse: '9a', stufe: 'Sekundarstufe I', standort: 'OBS' },
    { klasse: '9b', stufe: 'Sekundarstufe I', standort: 'OBS' },
    { klasse: '9c', stufe: 'Sekundarstufe I', standort: 'OBS' },
    { klasse: '9d', stufe: 'Sekundarstufe I', standort: 'OBS' },
    // Sekundarstufe II
    { klasse: '10a', stufe: 'Sekundarstufe II', standort: 'OBS' },
    { klasse: '10b', stufe: 'Sekundarstufe II', standort: 'OBS' },
    { klasse: '10c', stufe: 'Sekundarstufe II', standort: 'OBS' },
    { klasse: '11a', stufe: 'Sekundarstufe II', standort: 'OBS' },
    { klasse: '11b', stufe: 'Sekundarstufe II', standort: 'OBS' },
    { klasse: '12b', stufe: 'Sekundarstufe II', standort: 'OBS' },
    { klasse: 'Koop JSS', stufe: 'Sekundarstufe II', standort: 'Johannes Selenka' }
  ];

  const wochentage = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag'];
  const wochentagsNamen = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
  const zeitslots = ['08:00-08:45', '08:45-09:30', '09:50-10:35', '10:35-11:20', '11:40-12:50', '13:10-13:55', '13:55-14:40', '14:40-15:30'];

  const tabs = [
    { id: 'wochenplanung', label: 'Master-Wochenplanung', icon: '📅' },
    { klasse: 'vorlagen', label: 'Vorlagen & Templates', icon: '📋' },
    { id: 'statistiken', label: 'Auslastung & Statistiken', icon: '📊' },
    { id: 'export', label: 'Export & Druck', icon: '🖨️' }
  ];

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

  const getStufeColor = (stufe) => {
    const colors = {
      'Primarstufe': 'bg-green-100 text-green-800 border-green-300',
      'Sekundarstufe I': 'bg-blue-100 text-blue-800 border-blue-300',
      'Sekundarstufe II': 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[stufe] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // ✅ BIDIREKTIONALE SYNC FUNKTIONEN
  const assignPersonsToKlasse = (klasse, wochentag, zeitslot, personIds) => {
    setMasterStundenplaene(prev => {
      const updated = { ...prev };
      
      // Klasse erstellen falls nicht vorhanden
      if (!updated[klasse]) {
        updated[klasse] = {};
      }
      
      // Wochentag erstellen falls nicht vorhanden
      if (!updated[klasse][wochentag]) {
        updated[klasse][wochentag] = {};
      }
      
      // PersonIds zuweisen
      updated[klasse][wochentag][zeitslot] = [...personIds];
      
      return updated;
    });

    // Synchronisiere Personal-Stundenpläne
    syncPersonalStundenplaene && syncPersonalStundenplaene();
  };

  const removePersonFromKlasse = (klasse, wochentag, zeitslot, personId) => {
    setMasterStundenplaene(prev => {
      const updated = { ...prev };
      
      if (updated[klasse]?.[wochentag]?.[zeitslot]) {
        updated[klasse][wochentag][zeitslot] = updated[klasse][wochentag][zeitslot]
          .filter(id => id !== personId);
          
        // Leere Arrays entfernen
        if (updated[klasse][wochentag][zeitslot].length === 0) {
          delete updated[klasse][wochentag][zeitslot];
        }
      }
      
      return updated;
    });

    syncPersonalStundenplaene && syncPersonalStundenplaene();
  };

  const addNewKlasse = (klasseName, stufe, standort) => {
    const neueKlasse = { klasse: klasseName, stufe, standort };
    
    // Füge zu masterStundenplaene hinzu
    setMasterStundenplaene(prev => ({
      ...prev,
      [klasseName]: {
        'montag': {},
        'dienstag': {},
        'mittwoch': {},
        'donnerstag': {},
        'freitag': {}
      }
    }));
  };

  const openPersonModal = (klasse, wochentag, zeitslot) => {
    setCurrentAssignment({ klasse, wochentag, zeitslot });
    setShowPersonModal(true);
    setSearchTerm('');
    setSelectedPersons([]);
  };

  const assignPersons = () => {
    if (!currentAssignment || selectedPersons.length === 0) return;

    const { klasse, wochentag, zeitslot } = currentAssignment;
    const personIds = selectedPersons.map(name => 
      personalMitStatus.find(p => p.name === name)?.id
    ).filter(Boolean);

    assignPersonsToKlasse(klasse, wochentag, zeitslot, personIds);
    
    setShowPersonModal(false);
    setCurrentAssignment(null);
    setSelectedPersons([]);
  };

  const togglePersonSelection = (personName) => {
    setSelectedPersons(prev => {
      if (prev.includes(personName)) {
        return prev.filter(p => p !== personName);
      } else {
        return [...prev, personName];
      }
    });
  };

  // ✅ PERSON MODAL
  const PersonModal = () => {
    const filteredPersonal = personalMitStatus.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.aktiv
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Personal zuordnen
            </h3>
            <button onClick={() => setShowPersonModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={20} />
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <strong>{currentAssignment?.klasse}</strong> • {wochentagsNamen[wochentage.indexOf(currentAssignment?.wochentag || 'montag')]}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {currentAssignment?.zeitslot}
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Person suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto mb-4">
            <div
              onClick={() => {
                setSelectedPersons([]);
                assignPersons();
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border border-gray-200 dark:border-gray-600 rounded mb-2"
            >
              <span className="text-gray-500 dark:text-gray-400">--- Leer ---</span>
            </div>

            {filteredPersonal.map(person => {
              const isSelected = selectedPersons.includes(person.name);

              return (
                <div
                  key={person.name}
                  onClick={() => togglePersonSelection(person.name)}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border rounded mb-1 flex items-center justify-between ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded"
                    />
                    <span className="text-gray-900 dark:text-white">{person.name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getPersonTypColor(person.typ)}`}>
                    {person.typ}
                  </span>
                </div>
              );
            })}
          </div>

          {selectedPersons.length > 0 && (
            <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                Ausgewählt ({selectedPersons.length}):
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedPersons.map(personName => (
                  <span key={personName} className="bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs">
                    {personName}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowPersonModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Abbrechen
            </button>
            <button
              onClick={assignPersons}
              disabled={selectedPersons.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
            >
              Zuordnen ({selectedPersons.length})
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ NEUE KLASSE MODAL
  const KlasseModal = () => {
    const [klasseData, setKlasseData] = useState({
      name: '',
      stufe: 'Primarstufe',
      standort: 'OBS'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      addNewKlasse(klasseData.name, klasseData.stufe, klasseData.standort);
      setShowKlasseModal(false);
      setKlasseData({ name: '', stufe: 'Primarstufe', standort: 'OBS' });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Neue Klasse erstellen
            </h3>
            <button onClick={() => setShowKlasseModal(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Klassenname
              </label>
              <input
                type="text"
                value={klasseData.name}
                onChange={(e) => setKlasseData({ ...klasseData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="z.B. 1c, 5d, ..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stufe
              </label>
              <select 
                value={klasseData.stufe}
                onChange={(e) => setKlasseData({ ...klasseData, stufe: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Primarstufe">Primarstufe (1-4)</option>
                <option value="Sekundarstufe I">Sekundarstufe I (5-9)</option>
                <option value="Sekundarstufe II">Sekundarstufe II (10-12)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Standort
              </label>
              <select 
                value={klasseData.standort}
                onChange={(e) => setKlasseData({ ...klasseData, standort: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="OBS">OBS</option>
                <option value="Bürgerstraße">Bürgerstraße</option>
                <option value="Johannes Selenka">Johannes Selenka</option>
                <option value="Böcklinstraße">Böcklinstraße</option>
                <option value="Sidonienstraße">Sidonienstraße</option>
                <option value="HvF">Hoffmann von Fallersleben</option>
                <option value="Volkmarode">Volkmarode</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowKlasseModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Erstellen
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ✅ MASTER-WOCHENPLANUNG TAB
  const WochenplanungTab = () => (
    <div className="space-y-8">
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
        <h2 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-2">📅 Master-Stundenplanung</h2>
        <p className="text-purple-700 dark:text-purple-400 text-sm">
          Erstellen Sie hier den allgemeingültigen Stundenplan für alle Klassen.
          Änderungen sind sofort im Personal-Modul sichtbar.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('einzelklasse')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'einzelklasse'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Einzelklasse
              </button>
              <button
                onClick={() => setViewMode('uebersicht')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'uebersicht'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Übersicht
              </button>
            </div>

            {/* Klassen-Auswahl */}
            {viewMode === 'einzelklasse' && (
              <select
                value={selectedKlasse}
                onChange={(e) => setSelectedKlasse(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {klassenStruktur.map(k => (
                  <option key={k.klasse} value={k.klasse}>
                    {k.klasse} ({k.stufe} - {k.standort})
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowKlasseModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={18} />
              Neue Klasse
            </button>
            
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2">
              <Copy size={18} />
              Vorlage laden
            </button>
          </div>
        </div>
      </div>

      {/* Einzelklassen-Ansicht */}
      {viewMode === 'einzelklasse' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Klasse {selectedKlasse}</h3>
                <p className="text-blue-100 text-sm">
                  {klassenStruktur.find(k => k.klasse === selectedKlasse)?.stufe} • 
                  {klassenStruktur.find(k => k.klasse === selectedKlasse)?.standort}
                </p>
              </div>
              
              <div className="flex gap-2">
                {wochentage.map((tag, index) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedWochentag(tag)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      selectedWochentag === tag
                        ? 'bg-white text-blue-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {wochentagsNamen[index].substring(0, 2)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {wochentagsNamen[wochentage.indexOf(selectedWochentag)]}
            </h4>
            
            <div className="space-y-3">
              {zeitslots.map(zeitslot => {
                const personIds = masterStundenplaene[selectedKlasse]?.[selectedWochentag]?.[zeitslot] || [];
                
                return (
                  <div key={zeitslot} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {zeitslot}
                    </div>
                    
                    <div
                      onClick={() => openPersonModal(selectedKlasse, selectedWochentag, zeitslot)}
                      className="flex-1 min-h-12 flex items-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                    >
                      {personIds.length === 0 ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Plus size={16} />
                          <span>Personal zuweisen...</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {personIds.map(personId => {
                            const person = getPersonById(personId);
                            if (!person) return null;
                            
                            return (
                              <div key={personId} className={`px-3 py-1 rounded-full text-sm border flex items-center gap-2 ${getPersonTypColor(person.typ)}`}>
                                <span>{person.name}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removePersonFromKlasse(selectedKlasse, selectedWochentag, zeitslot, personId);
                                  }}
                                  className="hover:bg-red-200 rounded-full p-1"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Übersichts-Ansicht */}
      {viewMode === 'uebersicht' && (
        <div className="space-y-6">
          {['Primarstufe', 'Sekundarstufe I', 'Sekundarstufe II'].map(stufe => {
            const stufenKlassen = klassenStruktur.filter(k => k.stufe === stufe);
            
            return (
              <div key={stufe} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className={`p-4 ${stufe === 'Primarstufe' ? 'bg-green-500' : stufe === 'Sekundarstufe I' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                  <h3 className="text-xl font-bold text-white">{stufe}</h3>
                  <p className="text-white text-sm opacity-75">{stufenKlassen.length} Klassen</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {stufenKlassen.map(klassenInfo => {
                      const klassenplan = masterStundenplaene[klassenInfo.klasse] || {};
                      const gesamtStunden = Object.values(klassenplan).reduce((sum, tagesplan) => 
                        sum + Object.keys(tagesplan).length, 0
                      );
                      
                      return (
                        <div
                          key={klassenInfo.klasse}
                          onClick={() => {
                            setSelectedKlasse(klassenInfo.klasse);
                            setViewMode('einzelklasse');
                          }}
                          className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-900 dark:text-white">{klassenInfo.klasse}</h4>
                            <span className={`px-2 py-1 rounded text-xs ${getStufeColor(klassenInfo.stufe)}`}>
                              {klassenInfo.stufe === 'Primarstufe' ? 'PS' : 
                               klassenInfo.stufe === 'Sekundarstufe I' ? 'S1' : 'S2'}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            📍 {klassenInfo.standort}
                          </div>
                          
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {gesamtStunden} Termine/Woche
                          </div>
                          
                          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all"
                              style={{ width: `${Math.min((gesamtStunden / 40) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ✅ VORLAGEN TAB
  const VorlagenTab = () => (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
        <h2 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">📋 Vorlagen & Templates</h2>
        <p className="text-green-700 dark:text-green-400 text-sm">
          Nutzen Sie Vorlagen um Stundenpläne schnell zu erstellen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Standard-Vorlagen</h3>
          <div className="space-y-3">
            <button className="w-full p-3 text-left bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <div className="font-medium text-blue-800 dark:text-blue-300">Primarstufe Vorlage</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">5 Blöcke/Tag, 2x Deutsch, 2x Mathe</div>
            </button>
            
            <button className="w-full p-3 text-left bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <div className="font-medium text-green-800 dark:text-green-300">Sekundarstufe I Vorlage</div>
              <div className="text-sm text-green-600 dark:text-green-400">6 Blöcke/Tag, alle Fächer</div>
            </button>
            
            <button className="w-full p-3 text-left bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <div className="font-medium text-purple-800 dark:text-purple-300">Oberstufe Vorlage</div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Kursbasiert, variabel</div>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Eigene Vorlagen</h3>
          <div className="space-y-3">
            <button className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-800 dark:text-gray-300">Aktuelle als Vorlage speichern</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Für {selectedKlasse}</div>
            </button>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              <div className="text-gray-500 dark:text-gray-400 mb-2">Keine eigenen Vorlagen</div>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Erste Vorlage erstellen
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Wochenplan-Tools</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <Copy className="mx-auto mb-2 text-blue-600" size={24} />
            <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Woche kopieren</div>
          </button>
          
          <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <RotateCcw className="mx-auto mb-2 text-green-600" size={24} />
            <div className="text-sm font-medium text-green-800 dark:text-green-300">Woche leeren</div>
          </button>
          
          <button className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
            <Users className="mx-auto mb-2 text-yellow-600" size={24} />
            <div className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Auto-Zuordnung</div>
          </button>
          
          <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <Eye className="mx-auto mb-2 text-purple-600" size={24} />
            <div className="text-sm font-medium text-purple-800 dark:text-purple-300">Vorschau</div>
          </button>
        </div>
      </div>
    </div>
  );

  // ✅ STATISTIKEN TAB
  const StatistikenTab = () => {
    const gesamtPersonal = personalMitStatus.length;
    const aktivesPersonal = personalMitStatus.filter(p => p.aktiv).length;
    const gesamtKlassen = Object.keys(masterStundenplaene).length;
    
    // Berechne durchschnittliche Auslastung
    const personalAuslastung = personalMitStatus.map(person => {
      const termine = Object.values(masterStundenplaene).reduce((count, klassenplan) => {
        return count + Object.values(klassenplan).reduce((tagCount, tagesplan) => {
          return tagCount + Object.values(tagesplan).filter(personIds => 
            personIds.includes(person.id)
          ).length;
        }, 0);
      }, 0);
      
      return {
        name: person.name,
        termine,
        sollStunden: person.wochenstunden,
        auslastung: (termine / (person.wochenstunden || 1)) * 100
      };
    });

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <h2 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-2">📊 Auslastung & Statistiken</h2>
          <p className="text-blue-700 dark:text-blue-400 text-sm">
            Übersicht über die Personalauslastung und Planungsstatistiken.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{gesamtKlassen}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Geplante Klassen</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{aktivesPersonal}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Aktives Personal</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {Math.round(personalAuslastung.reduce((sum, p) => sum + p.auslastung, 0) / personalAuslastung.length)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Ø Auslastung</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {personalAuslastung.reduce((sum, p) => sum + p.termine, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Gesamt-Termine</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal-Auslastung</h3>
          <div className="space-y-3">
            {personalAuslastung.slice(0, 10).map(person => (
              <div key={person.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">{person.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {person.termine}/{person.sollStunden} ({Math.round(person.auslastung)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        person.auslastung > 100 ? 'bg-red-500' :
                        person.auslastung > 80 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(person.auslastung, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ✅ EXPORT TAB
  const ExportTab = () => (
    <div className="space-y-6">
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
        <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">🖨️ Export & Druck</h2>
        <p className="text-red-700 dark:text-red-400 text-sm">
          Exportieren Sie Stundenpläne in verschiedene Formate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">PDF Export</h3>
          <div className="space-y-3">
            <button className="w-full p-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-left">
              <div className="font-medium">Einzelklasse</div>
              <div className="text-sm opacity-75">Stundenplan für {selectedKlasse}</div>
            </button>
            
            <button className="w-full p-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-left">
              <div className="font-medium">Alle Klassen</div>
              <div className="text-sm opacity-75">Komplette Stundenplan-Übersicht</div>
            </button>
            
            <button className="w-full p-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-left">
              <div className="font-medium">Personal-Stundenpläne</div>
              <div className="text-sm opacity-75">Individuelle Pläne aller Personen</div>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weitere Formate</h3>
          <div className="space-y-3">
            <button className="w-full p-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-left">
              <div className="font-medium">Excel Export</div>
              <div className="text-sm opacity-75">Für weitere Bearbeitung</div>
            </button>
            
            <button className="w-full p-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-left">
              <div className="font-medium">CSV Export</div>
              <div className="text-sm opacity-75">Für Datenanalyse</div>
            </button>
            
            <button className="w-full p-3 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-left">
              <div className="font-medium">Druck-Vorschau</div>
              <div className="text-sm opacity-75">Optimiert für A4</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wochenplanung':
        return <WochenplanungTab />;
      case 'vorlagen':
        return <VorlagenTab />;
      case 'statistiken':
        return <StatistikenTab />;
      case 'export':
        return <ExportTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                📅 Master-Stundenplanung
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Erstellen Sie hier die allgemeingültigen Stundenpläne für alle Klassen
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                <Eye size={18} />
                Vorschau
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
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
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

      {/* Modals */}
      {showPersonModal && <PersonModal />}
      {showKlasseModal && <KlasseModal />}
    </div>
  );
};

export default StundenplanungModule;