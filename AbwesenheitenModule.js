import React, { useState } from 'react';
import { Search, Plus, Calendar, UserX, Users, X, Clock, Edit, Trash2, Save } from 'lucide-react';
import { useStundenplan } from '../context/StundenplanContext';

// ✅ HINWEIS: dataStore Prop entfernt. showToastMessage als Prop hinzugefügt.
const AbwesenheitenModule = ({ showToastMessage }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showKlassenModal, setShowKlassenModal] = useState(false);
  const [editingAbwesenheit, setEditingAbwesenheit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ NEU: Such-State für Personal-Modal
  const [personalSearchTerm, setPersonalSearchTerm] = useState('');

  // ✅ MODAL STATES FÜR PROFESSIONELLE BESTÄTIGUNG
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ✅ DataStore-Zugriff durch useStundenplan ersetzt
  const { 
    getPersonalMitStatus, 
    getPersonById,
    personalAbwesenheiten, 
    setPersonalAbwesenheiten,
    klassenAbwesenheiten,
    setKlassenAbwesenheiten 
  } = useStundenplan(); // ✅ useStundenplan Hook direkt genutzt

  const personalMitStatus = getPersonalMitStatus();

  const klassen = [
    '1a', '1b', '1c', '1d', '2a', '2b', '2d', '3a', '3b', '3d', 
    '4a', '4b', '4d', '5a', '5b', '5e', '6a', '6b', '6d', '6f',
    '7a', '7b', '7c', '8a', '8b', '9a', '9b', '9c', '9d',
    '10a', '10b', '10c', '11a', '11b', '12b', 'Koop JSS'
  ];

  // ✅ VERBESSERTE DATUM-FORMATIERUNG
  const formatDateRange = (von, bis) => {
    const vonDate = new Date(von);
    const bisDate = bis ? new Date(bis) : vonDate;
    
    const formatOptions = { day: '2-digit', month: '2-digit' };
    const vonStr = vonDate.toLocaleDateString('de-DE', formatOptions);
    const bisStr = bisDate.toLocaleDateString('de-DE', formatOptions);
    
    const year = vonDate.getFullYear();
    
    // Gleicher Tag
    if (von === bis || !bis) {
      return `${vonStr}.${year}`;
    }
    
    // Gleicher Monat
    if (vonDate.getMonth() === bisDate.getMonth() && vonDate.getFullYear() === bisDate.getFullYear()) {
      return `${vonDate.getDate().toString().padStart(2, '0')}. - ${bisStr}.${year}`;
    }
    
    // Verschiedene Monate/Jahre
    return `${vonStr} - ${bisStr}.${bisDate.getFullYear()}`;
  };

  // ✅ WOCHENTAG HINZUFÜGEN
  const formatDateRangeWithWeekday = (von, bis) => {
    const vonDate = new Date(von);
    const bisDate = bis ? new Date(bis) : vonDate;
    
    const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const vonWeekday = weekdays[vonDate.getDay()];
    const bisWeekday = weekdays[bisDate.getDay()];
    
    const baseRange = formatDateRange(von, bis);
    
    if (von === bis || !bis) {
      return `${vonWeekday} ${baseRange}`;
    } else {
      return `${vonWeekday} ${vonDate.getDate().toString().padStart(2, '0')}.${(vonDate.getMonth() + 1).toString().padStart(2, '0')}. - ${bisWeekday} ${bisDate.getDate().toString().padStart(2, '0')}.${(bisDate.getMonth() + 1).toString().padStart(2, '0')}.${bisDate.getFullYear()}`;
    }
  };

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

  // ✅ PERSONAL-ABWESENHEIT LÖSCHEN - PROFESSIONELL
  const deletePersonalAbwesenheit = (id) => {
    const abwesenheit = personalAbwesenheiten.find(a => a.id === id);
    setDeleteTarget({ type: 'personal', id, name: abwesenheit?.person || 'Unbekannt' });
    setShowDeleteModal(true);
  };

  // ✅ KLASSEN-ABWESENHEIT LÖSCHEN - PROFESSIONELL
  const deleteKlassenAbwesenheit = (id) => {
    const abwesenheit = klassenAbwesenheiten.find(a => a.id === id);
    setDeleteTarget({ type: 'klasse', id, name: `Klasse ${abwesenheit?.klasse}` || 'Unbekannt' });
    setShowDeleteModal(true);
  };

  // ✅ BESTÄTIGTES LÖSCHEN
  const confirmDelete = () => {
    if (deleteTarget?.type === 'personal') {
      setPersonalAbwesenheiten(prev => prev.filter(abw => abw.id !== deleteTarget.id));
      showToastMessage(`Abwesenheit von ${deleteTarget.name} gelöscht.`);
    } else if (deleteTarget?.type === 'klasse') {
      setKlassenAbwesenheiten(prev => prev.filter(abw => abw.id !== deleteTarget.id));
      showToastMessage(`Klassen-Abwesenheit für ${deleteTarget.name} gelöscht.`);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // ✅ FIXED: PERSONAL-MODAL MIT FUNKTIONIERENDER AUSWAHL
  const PersonalAbwesenheitModal = () => {
    const [selectedPersonId, setSelectedPersonId] = useState(editingAbwesenheit?.personId || '');
    const [grund, setGrund] = useState(editingAbwesenheit?.grund || '');
    const [dauer, setDauer] = useState(editingAbwesenheit?.dauer || '');
    const [vonDatum, setVonDatum] = useState(editingAbwesenheit?.von || '');
    const [bisDatum, setBisDatum] = useState(editingAbwesenheit?.bis || '');
    const [bemerkung, setBemerkung] = useState(editingAbwesenheit?.bemerkung || '');

    // ✅ FIXED: Suchfunktion für Personal - nur verfügbare Personen
    const filteredPersonal = personalMitStatus.filter(person => {
      // Beim Bearbeiten: zeige auch die bereits ausgewählte Person
      const isEditingThisPerson = editingAbwesenheit && person.id === editingAbwesenheit.personId;
      
      // Nur verfügbare Personen ODER die Person, die gerade bearbeitet wird
      const isAvailable = !person.abwesend || isEditingThisPerson;
      
      const matchesSearch = person.name.toLowerCase().includes(personalSearchTerm.toLowerCase()) ||
                          person.typ.toLowerCase().includes(personalSearchTerm.toLowerCase());
      
      return isAvailable && matchesSearch;
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!selectedPersonId || !grund || !dauer) return;

      const selectedPerson = getPersonById(parseInt(selectedPersonId));
      if (!selectedPerson) return;

      const abwesenheitData = {
        personId: parseInt(selectedPersonId),
        person: selectedPerson.name,
        typ: selectedPerson.typ,
        grund,
        von: vonDatum,
        bis: bisDatum || vonDatum,
        dauer,
        bemerkung
      };

      if (editingAbwesenheit) {
        setPersonalAbwesenheiten(prev => prev.map(abw => 
          abw.id === editingAbwesenheit.id 
            ? { ...abw, ...abwesenheitData }
            : abw
        ));
        showToastMessage(`Abwesenheit für ${selectedPerson.name} aktualisiert.`);
      } else {
        const newAbwesenheit = {
          id: Date.now(),
          ...abwesenheitData
        };
        setPersonalAbwesenheiten(prev => [newAbwesenheit, ...prev]);
        showToastMessage(`Neue Abwesenheit für ${selectedPerson.name} erfasst.`);
      }

      // Modal schließen und zurücksetzen
      setShowPersonalModal(false);
      setEditingAbwesenheit(null);
      setSelectedPersonId('');
      setPersonalSearchTerm('');
      setGrund('');
      setDauer('');
      setVonDatum('');
      setBisDatum('');
      setBemerkung('');
    };

    const handlePersonClick = (personId) => {
      console.log('🔍 Person geklickt:', personId);
      setSelectedPersonId(personId.toString());
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingAbwesenheit ? 'Abwesenheit bearbeiten' : 'Personal-Abwesenheit erfassen'}
            </h3>
            <button 
              onClick={() => {
                setShowPersonalModal(false);
                setEditingAbwesenheit(null);
                setPersonalSearchTerm('');
                setSelectedPersonId('');
              }} 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ✅ FIXED: NEUE FUNKTIONIERENDE PERSON-AUSWAHL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Person auswählen
              </label>
              
              {/* Such-Input */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Person suchen (Name oder Typ)..."
                  value={personalSearchTerm}
                  onChange={(e) => setPersonalSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              {/* ✅ FIXED: SCROLLBARE PERSONEN-LISTE MIT FUNKTIONIERENDER AUSWAHL */}
              <div className="border border-gray-300 dark:border-gray-600 rounded max-h-48 overflow-y-auto bg-white dark:bg-gray-700">
                {filteredPersonal.length === 0 ? (
                  <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                    {personalSearchTerm ? 'Keine Personen gefunden' : 'Keine verfügbaren Personen'}
                  </div>
                ) : (
                  filteredPersonal.map(person => (
                    <div
                      key={person.id}
                      onClick={() => handlePersonClick(person.id)}
                      className={`p-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                        selectedPersonId === person.id.toString() 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white text-sm flex items-center gap-2">
                            {person.name}
                            {selectedPersonId === person.id.toString() && (
                              <span className="text-blue-600 text-xs">✓ Ausgewählt</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {person.standorte?.join(', ')} • {person.email}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${getPersonTypColor(person.typ)}`}>
                          {person.typ}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ✅ BESTÄTIGUNG DER AUSWAHL */}
              {selectedPersonId && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-300 dark:border-blue-700">
                  {(() => {
                    const person = getPersonById(parseInt(selectedPersonId));
                    return person ? (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-900 dark:text-blue-300 text-sm">
                          ✅ {person.name}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getPersonTypColor(person.typ)}`}>
                          {person.typ}
                        </span>
                      </div>
                    ) : (
                      <span className="text-red-600 text-sm">❌ Person nicht gefunden</span>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Schnellantworten */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dauer</label>
              <div className="grid grid-cols-2 gap-2">
                {['Bis Tagesende', 'Wenige Stunden', 'Mehrere Tage', 'Bis Datum'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDauer(option)}
                    className={`p-2 text-sm border rounded transition-colors ${
                      dauer === option 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Grund */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grund</label>
              <select
                value={grund}
                onChange={(e) => setGrund(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Grund auswählen...</option>
                <option value="Krank">Krank</option>
                <option value="Fortbildung">Fortbildung</option>
                <option value="Termin">Termin</option>
                <option value="Urlaub">Urlaub</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
            </div>

            {/* Datum */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Von</label>
                <input
                  type="date"
                  value={vonDatum}
                  onChange={(e) => setVonDatum(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              {dauer === 'Mehrere Tage' || dauer === 'Bis Datum' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bis</label>
                  <input
                    type="date"
                    value={bisDatum}
                    onChange={(e) => setBisDatum(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              ) : null}
            </div>

            {/* Bemerkung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bemerkung (optional)</label>
              <textarea
                value={bemerkung}
                onChange={(e) => setBemerkung(e.target.value)}
                placeholder="Zusätzliche Informationen..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows="2"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowPersonalModal(false);
                  setEditingAbwesenheit(null);
                  setPersonalSearchTerm('');
                  setSelectedPersonId('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={!selectedPersonId || !grund || !dauer}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {editingAbwesenheit ? 'Speichern' : 'Erfassen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ✅ KLASSEN-ABWESENHEIT MODAL (bleibt gleich)
  const KlassenAbwesenheitModal = () => {
    const [selectedKlasse, setSelectedKlasse] = useState(editingAbwesenheit?.klasse || '');
    const [grund, setGrund] = useState(editingAbwesenheit?.grund || '');
    const [vonDatum, setVonDatum] = useState(editingAbwesenheit?.von || '');
    const [bisDatum, setBisDatum] = useState(editingAbwesenheit?.bis || '');
    const [bemerkung, setBemerkung] = useState(editingAbwesenheit?.bemerkung || '');

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!selectedKlasse || !grund) return;

      const abwesenheitData = {
        klasse: selectedKlasse,
        grund,
        von: vonDatum,
        bis: bisDatum || vonDatum,
        bemerkung
      };

      if (editingAbwesenheit) {
        setKlassenAbwesenheiten(prev => prev.map(abw => 
          abw.id === editingAbwesenheit.id 
            ? { ...abw, ...abwesenheitData }
            : abw
        ));
        showToastMessage(`Klassen-Abwesenheit für ${selectedKlasse} aktualisiert.`);
      } else {
        const newAbwesenheit = {
          id: Date.now(),
          ...abwesenheitData
        };
        setKlassenAbwesenheiten(prev => [newAbwesenheit, ...prev]);
        showToastMessage(`Neue Klassen-Abwesenheit für ${selectedKlasse} erfasst.`);
      }

      setShowKlassenModal(false);
      setEditingAbwesenheit(null);
      setSelectedKlasse('');
      setGrund('');
      setVonDatum('');
      setBisDatum('');
      setBemerkung('');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingAbwesenheit ? 'Klassenabwesenheit bearbeiten' : 'Klassen-Abwesenheit erfassen'}
            </h3>
            <button 
              onClick={() => {
                setShowKlassenModal(false);
                setEditingAbwesenheit(null);
              }} 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Klasse</label>
              <select
                value={selectedKlasse}
                onChange={(e) => setSelectedKlasse(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Klasse auswählen...</option>
                {klassen.map(klasse => (
                  <option key={klasse} value={klasse}>{klasse}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grund</label>
              <select
                value={grund}
                onChange={(e) => setGrund(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Grund auswählen...</option>
                <option value="Ausflug">Ausflug</option>
                <option value="Klassenfahrt">Klassenfahrt</option>
                <option value="Betriebspraktikum">Betriebspraktikum</option>
                <option value="Projektwoche">Projektwoche</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Von</label>
                <input
                  type="date"
                  value={vonDatum}
                  onChange={(e) => setVonDatum(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bis</label>
                <input
                  type="date"
                  value={bisDatum}
                  onChange={(e) => setBisDatum(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bemerkung (optional)</label>
              <textarea
                value={bemerkung}
                onChange={(e) => setBemerkung(e.target.value)}
                placeholder="Zusätzliche Informationen..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows="2"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowKlassenModal(false);
                  setEditingAbwesenheit(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={!selectedKlasse || !grund}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {editingAbwesenheit ? 'Speichern' : 'Erfassen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ✅ PROFESSIONELLES DELETE MODAL
  const DeleteConfirmationModal = () => {
    if (!showDeleteModal || !deleteTarget) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Abwesenheit löschen
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Möchten Sie die Abwesenheit von <strong>{deleteTarget.name}</strong> wirklich löschen?
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteTarget(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Löschen
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h1 className="module-title">❌ Abwesenheiten-Verwaltung</h1>
        <p className="module-subtitle">Erfassen und verwalten Sie Personal- und Klassenabwesenheiten</p>
      </div>

      <div className="card">
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-600">
          <button
            onClick={() => setActiveTab('personal')}
            className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'personal'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserX size={18} />
              Personal-Abwesenheiten
            </div>
          </button>
          <button
            onClick={() => setActiveTab('klassen')}
            className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'klassen'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={18} />
              Klassen-Abwesenheiten
            </div>
          </button>
        </div>

        {activeTab === 'personal' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Personal-Abwesenheiten</h3>
              <button 
                onClick={() => setShowPersonalModal(true)}
                className="btn btn-primary"
              >
                <Plus size={20} />
                Neue Abwesenheit
              </button>
            </div>

            <div className="space-y-4">
              {personalAbwesenheiten.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <UserX size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-medium mb-2">Keine Abwesenheiten</h3>
                  <p>Alle Personen sind anwesend.</p>
                </div>
              ) : (
                personalAbwesenheiten.map(abwesenheit => {
                  const person = getPersonById(abwesenheit.personId) || { name: abwesenheit.person, typ: abwesenheit.typ };
                  
                  return (
                    <div key={abwesenheit.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPersonTypColor(person.typ)}`}>
                            {person.typ}
                          </span>
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{person.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {abwesenheit.grund} • {abwesenheit.dauer}
                            </p>
                            {abwesenheit.bemerkung && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{abwesenheit.bemerkung}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar size={14} />
                              <span>{formatDateRangeWithWeekday(abwesenheit.von, abwesenheit.bis)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingAbwesenheit(abwesenheit);
                                setShowPersonalModal(true);
                              }}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="Bearbeiten"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deletePersonalAbwesenheit(abwesenheit.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Löschen"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'klassen' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Klassen-Abwesenheiten</h3>
              <button 
                onClick={() => setShowKlassenModal(true)}
                className="btn btn-primary"
              >
                <Plus size={20} />
                Neue Abwesenheit
              </button>
            </div>

            <div className="space-y-4">
              {klassenAbwesenheiten.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Users size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-medium mb-2">Keine Abwesenheiten</h3>
                  <p>Alle Klassen sind anwesend.</p>
                </div>
              ) : (
                klassenAbwesenheiten.map(abwesenheit => (
                  <div key={abwesenheit.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-full text-sm font-medium">
                          {abwesenheit.klasse}
                        </span>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">{abwesenheit.grund}</h4>
                          {abwesenheit.bemerkung && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{abwesenheit.bemerkung}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar size={14} />
                            <span>{formatDateRangeWithWeekday(abwesenheit.von, abwesenheit.bis)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingAbwesenheit(abwesenheit);
                              setShowKlassenModal(true);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Bearbeiten"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteKlassenAbwesenheit(abwesenheit.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Löschen"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showPersonalModal && <PersonalAbwesenheitModal />}
      {showKlassenModal && <KlassenAbwesenheitModal />}
      <DeleteConfirmationModal />
    </div>
  );
};

export default AbwesenheitenModule;