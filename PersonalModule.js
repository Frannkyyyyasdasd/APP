import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Eye, EyeOff, MapPin, Mail, Users, Clock, ChevronDown, ChevronUp, X, Coffee, Sun, Moon, Save, Trash2 } from 'lucide-react';

const PersonalModule = ({ dataStore }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPerson, setExpandedPerson] = useState(null);
  const [filterTyp, setFilterTyp] = useState('alle');
  const [filterStandort, setFilterStandort] = useState('alle');
  const [showModal, setShowModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [selectedWochentag, setSelectedWochentag] = useState('montag');
  const [showTerminModal, setShowTerminModal] = useState(false);
  const [currentPerson, setCurrentPerson] = useState(null);

  // ✅ DataStore-Zugriff
  const { 
    getPersonalMitStatus, 
    personal, 
    setPersonal,
    getPersonById,
    masterStundenplaene,
    setMasterStundenplaene,
    masterPausenaufsichten,
    setMasterPausenaufsichten,
    syncPersonalStundenplaene
  } = dataStore || {};
  
  const personalMitStatus = React.useMemo(() => {
    if (getPersonalMitStatus && typeof getPersonalMitStatus === 'function') {
      return getPersonalMitStatus();
    }
    return personal || [];
  }, [getPersonalMitStatus, personal]);

  // ✅ Alle verfügbaren Klassen aus masterStundenplaene
  const verfuegbareKlassen = React.useMemo(() => {
    return masterStundenplaene ? Object.keys(masterStundenplaene) : [];
  }, [masterStundenplaene]);

  // ✅ Zeitslots definieren
  const zeitslots = [
    '08:00-08:45', '08:45-09:30', '09:50-10:35', '10:35-11:20', 
    '11:40-12:50', '13:10-13:55', '13:55-14:40', '14:40-15:30'
  ];

  const pausenZeiten = {
    'fruehaufsicht': '07:45-08:00',
    'pause1': '09:30-09:50',
    'pause2': '11:20-11:40', 
    'pause3': '12:50-13:10',
    'spaetaufsicht': '14:40-15:30'
  };

  const wochentage = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag'];
  const wochentagsNamen = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

  // ✅ NEU: Automatisch generierte Stundenpläne berechnen
  const generatePersonalStundenplaene = React.useMemo(() => {
    const stundenplaene = {};
    
    // Für jede Person einen leeren Stundenplan erstellen
    personalMitStatus.forEach(person => {
      stundenplaene[person.name] = {
        'montag': [],
        'dienstag': [],
        'mittwoch': [],
        'donnerstag': [],
        'freitag': []
      };
    });

    // Unterrichtsstunden hinzufügen
    if (masterStundenplaene) {
      Object.entries(masterStundenplaene).forEach(([klasse, wochenplan]) => {
        Object.entries(wochenplan).forEach(([wochentag, tagesplan]) => {
          Object.entries(tagesplan).forEach(([zeitslot, personIds]) => {
            personIds.forEach(personId => {
              const person = getPersonById ? getPersonById(personId) : null;
              if (person && stundenplaene[person.name]) {
                stundenplaene[person.name][wochentag].push({
                  zeit: zeitslot,
                  typ: 'Unterricht',
                  ort: `Klasse ${klasse}`,
                  details: klasse,
                  farbe: 'bg-blue-100 text-blue-800 border-blue-300',
                  quelle: 'stundenplan'
                });
              }
            });
          });
        });
      });
    }

    // Pausenaufsichten hinzufügen
    if (masterPausenaufsichten) {
      Object.entries(masterPausenaufsichten).forEach(([wochentag, tagesaufsichten]) => {
        // Frühaufsicht
        if (tagesaufsichten.fruehaufsicht) {
          Object.entries(tagesaufsichten.fruehaufsicht).forEach(([bereich, personId]) => {
            const person = getPersonById ? getPersonById(personId) : null;
            if (person && stundenplaene[person.name]) {
              stundenplaene[person.name][wochentag].push({
                zeit: pausenZeiten.fruehaufsicht,
                typ: 'Frühaufsicht',
                ort: bereich,
                details: 'Frühaufsicht',
                farbe: 'bg-cyan-100 text-cyan-800 border-cyan-300',
                quelle: 'pausenaufsicht'
              });
            }
          });
        }

        // Pausenaufsichten (1, 2, 3)
        ['pause1', 'pause2', 'pause3'].forEach((pauseKey, index) => {
          if (!tagesaufsichten[pauseKey]) return;
          
          const pauseZeit = pausenZeiten[pauseKey];

          // Hauptaufsichten
          if (tagesaufsichten[pauseKey].hauptaufsichten) {
            Object.values(tagesaufsichten[pauseKey].hauptaufsichten).forEach(bereichsgruppe => {
              Object.entries(bereichsgruppe).forEach(([bereich, personId]) => {
                const person = getPersonById ? getPersonById(personId) : null;
                if (person && stundenplaene[person.name]) {
                  stundenplaene[person.name][wochentag].push({
                    zeit: pauseZeit,
                    typ: `${index + 1}. Pause`,
                    ort: bereich,
                    details: 'Hauptaufsicht',
                    farbe: 'bg-orange-100 text-orange-800 border-orange-300',
                    quelle: 'pausenaufsicht'
                  });
                }
              });
            });
          }

          // Einzelaufsichten
          if (tagesaufsichten[pauseKey].einzelaufsichten) {
            tagesaufsichten[pauseKey].einzelaufsichten.forEach(einzelaufsicht => {
              const person = getPersonById ? getPersonById(einzelaufsicht.personId) : null;
              if (person && stundenplaene[person.name]) {
                stundenplaene[person.name][wochentag].push({
                  zeit: pauseZeit,
                  typ: `${index + 1}. Pause`,
                  ort: einzelaufsicht.schueler,
                  details: 'Einzelaufsicht',
                  farbe: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                  quelle: 'pausenaufsicht'
                });
              }
            });
          }
        });

        // Spätaufsicht
        if (tagesaufsichten.spaetaufsicht) {
          Object.entries(tagesaufsichten.spaetaufsicht).forEach(([bereich, personId]) => {
            const person = getPersonById ? getPersonById(personId) : null;
            if (person && stundenplaene[person.name]) {
              stundenplaene[person.name][wochentag].push({
                zeit: pausenZeiten.spaetaufsicht,
                typ: 'Spätaufsicht',
                ort: bereich,
                details: 'Spätaufsicht',
                farbe: 'bg-purple-100 text-purple-800 border-purple-300',
                quelle: 'pausenaufsicht'
              });
            }
          });
        }
      });
    }

    // Sortiere die Termine nach Zeit
    Object.keys(stundenplaene).forEach(personName => {
      Object.keys(stundenplaene[personName]).forEach(wochentag => {
        stundenplaene[personName][wochentag].sort((a, b) => {
          const zeitA = a.zeit.split('-')[0];
          const zeitB = b.zeit.split('-')[0];
          return zeitA.localeCompare(zeitB);
        });
      });
    });

    return stundenplaene;
  }, [personalMitStatus, masterStundenplaene, masterPausenaufsichten, getPersonById]);

  // ✅ BIDIREKTIONALE SYNC FUNKTIONEN
  
  // Neuen Unterrichtstermin hinzufügen
  const addUnterrichtstermin = (personName, wochentag, zeitslot, klasse) => {
    const person = personalMitStatus.find(p => p.name === personName);
    if (!person) return;

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
      
      // Zeitslot erstellen falls nicht vorhanden
      if (!updated[klasse][wochentag][zeitslot]) {
        updated[klasse][wochentag][zeitslot] = [];
      }
      
      // Person hinzufügen (falls nicht schon vorhanden)
      if (!updated[klasse][wochentag][zeitslot].includes(person.id)) {
        updated[klasse][wochentag][zeitslot].push(person.id);
      }
      
      return updated;
    });

    syncPersonalStundenplaene && syncPersonalStundenplaene();
  };

  // Unterrichtstermin entfernen
  const removeUnterrichtstermin = (personName, wochentag, zeitslot, klasse) => {
    const person = personalMitStatus.find(p => p.name === personName);
    if (!person) return;

    setMasterStundenplaene(prev => {
      const updated = { ...prev };
      
      if (updated[klasse]?.[wochentag]?.[zeitslot]) {
        updated[klasse][wochentag][zeitslot] = updated[klasse][wochentag][zeitslot]
          .filter(personId => personId !== person.id);
          
        // Leere Arrays entfernen
        if (updated[klasse][wochentag][zeitslot].length === 0) {
          delete updated[klasse][wochentag][zeitslot];
        }
      }
      
      return updated;
    });

    syncPersonalStundenplaene && syncPersonalStundenplaene();
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

  const getPersonTypText = (typ) => {
    const types = {
      'LT': 'Leitung',
      'LK': 'Lehrkraft',
      'PF': 'Päd. Fachkraft',
      'LiVD': 'Lehrkraft i.V.',
      'TP': 'Therapeut*in',
      'P': 'Praktikant*in'
    };
    return types[typ] || typ;
  };

  const getPersonInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredPersonal = React.useMemo(() => {
    return personalMitStatus.filter(person => {
      const nameMatch = person.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const typMatch = filterTyp === 'alle' || person.typ === filterTyp;
      const standortMatch = filterStandort === 'alle' || person.standorte?.includes(filterStandort);
      return nameMatch && typMatch && standortMatch;
    });
  }, [personalMitStatus, searchTerm, filterTyp, filterStandort]);

  const togglePersonDetails = (personId) => {
    setExpandedPerson(expandedPerson === personId ? null : personId);
  };

  const togglePersonStatus = (personId) => {
    if (setPersonal && typeof setPersonal === 'function') {
      setPersonal(prev => prev.map(person =>
        person.id === personId ? { ...person, aktiv: !person.aktiv } : person
      ));
    }
  };

  // ✅ NEUE TERMIN MODAL
  const TerminModal = () => {
    const [terminData, setTerminData] = useState({
      typ: 'Unterricht',
      wochentag: 'montag',
      zeitslot: '08:00-08:45',
      klasse: '',
      ort: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (terminData.typ === 'Unterricht' && terminData.klasse) {
        addUnterrichtstermin(
          currentPerson.name, 
          terminData.wochentag, 
          terminData.zeitslot, 
          terminData.klasse
        );
      }
      
      setShowTerminModal(false);
      setCurrentPerson(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Neuen Termin hinzufügen
            </h3>
            <button 
              onClick={() => {
                setShowTerminModal(false);
                setCurrentPerson(null);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Typ
              </label>
              <select 
                value={terminData.typ}
                onChange={(e) => setTerminData({ ...terminData, typ: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Unterricht">Unterricht</option>
                <option value="Pausenaufsicht">Pausenaufsicht</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wochentag
                </label>
                <select 
                  value={terminData.wochentag}
                  onChange={(e) => setTerminData({ ...terminData, wochentag: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {wochentage.map((tag, index) => (
                    <option key={tag} value={tag}>{wochentagsNamen[index]}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zeit
                </label>
                <select 
                  value={terminData.zeitslot}
                  onChange={(e) => setTerminData({ ...terminData, zeitslot: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {zeitslots.map(zeit => (
                    <option key={zeit} value={zeit}>{zeit}</option>
                  ))}
                </select>
              </div>
            </div>

            {terminData.typ === 'Unterricht' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Klasse
                </label>
                <select 
                  value={terminData.klasse}
                  onChange={(e) => setTerminData({ ...terminData, klasse: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Klasse auswählen...</option>
                  {verfuegbareKlassen.map(klasse => (
                    <option key={klasse} value={klasse}>{klasse}</option>
                  ))}
                  <option value="NEUE_KLASSE">+ Neue Klasse erstellen</option>
                </select>
                
                {terminData.klasse === 'NEUE_KLASSE' && (
                  <input
                    type="text"
                    placeholder="Name der neuen Klasse (z.B. 1c)"
                    onChange={(e) => setTerminData({ ...terminData, klasse: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-2"
                  />
                )}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowTerminModal(false);
                  setCurrentPerson(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 font-medium"
              >
                Hinzufügen
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ✅ PERSON MODAL (für neue Personen)
  const PersonModal = () => {
    const [formData, setFormData] = useState(
      editingPerson || {
        name: '',
        typ: 'LK',
        email: '',
        standorte: [],
        wochenstunden: '',
        aktiv: true
      }
    );

    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (!setPersonal || typeof setPersonal !== 'function') {
        console.error('setPersonal function not available');
        return;
      }
      
      if (editingPerson) {
        // Bearbeiten
        setPersonal(prev => prev.map(person =>
          person.id === editingPerson.id 
            ? { ...person, ...formData, wochenstunden: parseInt(formData.wochenstunden) }
            : person
        ));
      } else {
        // Neu hinzufügen
        const neuePerson = {
          id: Date.now(),
          ...formData,
          wochenstunden: parseInt(formData.wochenstunden)
        };
        setPersonal(prev => [...prev, neuePerson]);
      }
      
      setShowModal(false);
      setEditingPerson(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingPerson ? 'Person bearbeiten' : 'Neue Person'}
            </h3>
            <button 
              onClick={() => {
                setShowModal(false);
                setEditingPerson(null);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Vollständiger Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Typ
                </label>
                <select 
                  value={formData.typ}
                  onChange={(e) => setFormData({ ...formData, typ: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="LK">Lehrkraft</option>
                  <option value="LT">Leitung</option>
                  <option value="PF">Päd. Fachkraft</option>
                  <option value="LiVD">Lehrkraft i.V.</option>
                  <option value="TP">Therapeut*in</option>
                  <option value="P">Praktikant*in</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="email@schule.de"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wochenstunden
                </label>
                <input
                  type="number"
                  value={formData.wochenstunden}
                  onChange={(e) => setFormData({ ...formData, wochenstunden: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="25"
                  min="1"
                  max="50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Standorte
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['OBS', 'Bürgerstraße', 'Johannes Selenka Schule', 'Böcklinstraße', 'Sidonienstraße', 'Hoffmann von Fallersleben'].map(standort => (
                  <label key={standort} className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.standorte.includes(standort)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, standorte: [...formData.standorte, standort] });
                        } else {
                          setFormData({ ...formData, standorte: formData.standorte.filter(s => s !== standort) });
                        }
                      }}
                      className="mr-2 rounded" 
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{standort}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingPerson(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 font-medium"
              >
                {editingPerson ? 'Speichern' : 'Hinzufügen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            👥 Personal-Verwaltung
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verwalten Sie Personalakten und individuelle Stundenpläne (automatisch generiert)
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Person suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <select
                value={filterTyp}
                onChange={(e) => setFilterTyp(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="alle">Alle Positionen</option>
                <option value="LT">Leitung</option>
                <option value="LK">Lehrkräfte</option>
                <option value="PF">Päd. Fachkräfte</option>
                <option value="LiVD">Lehrkräfte i.V.</option>
                <option value="TP">Therapeut*innen</option>
                <option value="P">Praktikant*innen</option>
              </select>

              <select
                value={filterStandort}
                onChange={(e) => setFilterStandort(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="alle">Alle Standorte</option>
                <option value="OBS">OBS</option>
                <option value="Bürgerstraße">Bürgerstraße</option>
                <option value="Johannes Selenka Schule">Johannes Selenka</option>
                <option value="Böcklinstraße">Böcklinstraße</option>
                <option value="Sidonienstraße">Sidonienstraße</option>
                <option value="Hoffmann von Fallersleben">HvF</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-medium flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
            >
              <Plus size={20} />
              Neue Person
            </button>
          </div>
        </div>

        {/* Personal Grid */}
        <div className="grid gap-6">
          {filteredPersonal.map(person => {
            const personStundenplan = generatePersonalStundenplaene[person.name] || {};
            
            return (
              <div
                key={person.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
              >
                {/* Person Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  onClick={() => togglePersonDetails(person.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${person.typ === 'LT' ? 'from-purple-500 to-purple-700' :
                                                                                  person.typ === 'LK' ? 'from-blue-500 to-blue-700' :
                                                                                  person.typ === 'PF' ? 'from-green-500 to-green-700' :
                                                                                  person.typ === 'LiVD' ? 'from-yellow-500 to-yellow-600' :
                                                                                  person.typ === 'TP' ? 'from-pink-500 to-pink-700' :
                                                                                  'from-gray-500 to-gray-700'} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {getPersonInitials(person.name)}
                      </div>
                      
                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {person.name}
                          </h3>
                          {person.abwesend && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                              Abwesend: {person.abwesenheitsgrund}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePersonStatus(person.id);
                            }}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              person.aktiv 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                            }`}
                          >
                            {person.aktiv ? <Eye size={14} /> : <EyeOff size={14} />}
                            {person.aktiv ? 'Aktiv' : 'Inaktiv'}
                          </button>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {getPersonTypText(person.typ)} • {person.email}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {person.standorte?.map(standort => (
                            <span key={standort} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded text-sm font-medium">
                              {standort}
                            </span>
                          )) || <span className="text-sm text-gray-500">Keine Standorte</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {person.wochenstunden}h
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          pro Woche
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPerson(person);
                            setShowTerminModal(true);
                          }}
                          className="p-2 text-green-600 hover:text-green-800 transition-colors"
                          title="Neuen Termin hinzufügen"
                        >
                          <Plus size={20} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPerson(person);
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <Edit size={20} />
                        </button>
                        
                        {expandedPerson === person.id ? (
                          <ChevronUp size={24} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={24} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedPerson === person.id && (
                  <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                    {/* Wochenstundenplan */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Clock size={20} />
                          Automatisch generierter Stundenplan
                        </h4>
                        <div className="flex gap-2">
                          {wochentage.map((tag, index) => (
                            <button
                              key={tag}
                              onClick={() => setSelectedWochentag(tag)}
                              className={`px-3 py-1 text-sm rounded ${
                                selectedWochentag === tag
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              {wochentagsNamen[index].substring(0, 2)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                          {wochentagsNamen[wochentage.indexOf(selectedWochentag)]}
                        </h5>
                        
                        <div className="space-y-2">
                          {personStundenplan[selectedWochentag]?.length === 0 || !personStundenplan[selectedWochentag] ? (
                            <p className="text-gray-500 dark:text-gray-400 text-sm italic text-center py-4">
                              Keine Termine für {wochentagsNamen[wochentage.indexOf(selectedWochentag)]}
                            </p>
                          ) : (
                            personStundenplan[selectedWochentag]?.map((termin, index) => (
                              <div key={index} className={`p-3 rounded-lg border ${termin.farbe} flex items-center justify-between`}>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium text-sm">{termin.zeit}</span>
                                    <span className="text-sm">{termin.typ}</span>
                                    <span className="text-sm text-gray-600">• {termin.ort}</span>
                                  </div>
                                  {termin.details && (
                                    <div className="text-xs text-gray-500 mt-1">{termin.details}</div>
                                  )}
                                </div>
                                
                                {termin.quelle === 'stundenplan' && (
                                  <button
                                    onClick={() => removeUnterrichtstermin(person.name, selectedWochentag, termin.zeit, termin.details)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Unterrichtstermin entfernen"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Wochenübersicht */}
                    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Calendar size={16} />
                        Wochenübersicht (kompakt)
                      </h4>
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        {wochentage.map((tag, index) => (
                          <div key={tag} className="text-center">
                            <div className="font-medium text-gray-900 dark:text-white mb-2">
                              {wochentagsNamen[index].substring(0, 2)}
                            </div>
                            <div className="space-y-1">
                              {personStundenplan[tag]?.slice(0, 3).map((termin, tIndex) => (
                                <div key={tIndex} className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-300 rounded px-1 py-0.5 text-[10px]">
                                  {termin.zeit.split('-')[0]}
                                </div>
                              )) || (
                                <div className="text-gray-400 text-[10px]">-</div>
                              )}
                              {personStundenplan[tag]?.length > 3 && (
                                <div className="text-gray-500 text-[10px]">
                                  +{personStundenplan[tag].length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredPersonal.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Keine Personen gefunden
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Versuchen Sie einen anderen Suchbegriff oder fügen Sie eine neue Person hinzu.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && <PersonModal />}
      {showTerminModal && <TerminModal />}
    </div>
  );
};

export default PersonalModule;