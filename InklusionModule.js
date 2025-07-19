import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Users, Clock, Edit, X, Save, Trash2, Calendar, Mail, Phone, FileText, Download, AlertTriangle, Check, User, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useStundenplan } from '../context/StundenplanContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const InklusionModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'schule', 'schueler', 'betreuung', 'zeiten'
  const [editingItem, setEditingItem] = useState(null);
  const [selectedSchueler, setSelectedSchueler] = useState(null);
  const [expandedSchueler, setExpandedSchueler] = useState(null);
  
  // ✅ Context-Zugriff
  const { 
    getPersonalMitStatus, 
    getPersonById,
    inklusionsSchulen,
    setInklusionsSchulen,
    inklusionsSchueler,
    setInklusionsSchueler,
    inklusionsBetreuungen,
    setInklusionsBetreuungen,
    getInklusionsSchuleById,
    getInklusionsSchuelerById,
    getBetreuungenFuerPerson,
    getBetreuungenFuerSchueler,
    syncPersonalStundenplaene
  } = useStundenplan();
  
  const personalMitStatus = getPersonalMitStatus();

  // ✅ PERSISTENTE SPEICHERUNG
  const STORAGE_KEY = 'inklusion_module_data_v2';
  
  const saveToStorage = (data) => {
    try {
      const saveData = {
        ...data,
        timestamp: new Date().toISOString(),
        version: '2.0'
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
      console.log('✅ Inklusions-Daten gespeichert');
    } catch (error) {
      console.error('❌ Inklusions-Speicherfehler:', error);
    }
  };

  // ✅ AUTO-SPEICHERUNG
  useEffect(() => {
    saveToStorage({ 
      inklusionsSchulen, 
      inklusionsSchueler, 
      inklusionsBetreuungen 
    });
  }, [inklusionsSchulen, inklusionsSchueler, inklusionsBetreuungen]);

  // ✅ INITIAL DATA falls noch nicht vorhanden
  useEffect(() => {
    if (inklusionsSchulen.length === 0) {
      setInklusionsSchulen([
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
        }
      ]);
    }

    if (inklusionsSchueler.length === 0) {
      setInklusionsSchueler([
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
        }
      ]);
    }

    if (Object.keys(inklusionsBetreuungen).length === 0) {
      setInklusionsBetreuungen({
        '3_1': { // PersonId_SchuelerId
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
          notizen: 'Fokus auf Selbstständigkeit'
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
          notizen: 'Therapiebegleitung'
        }
      });
    }
  }, [inklusionsSchulen, inklusionsSchueler, inklusionsBetreuungen, setInklusionsSchulen, setInklusionsSchueler, setInklusionsBetreuungen]);

  const wochentage = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag'];
  const wochentagsNamen = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

  // ✅ FILTER-FUNKTIONEN
  const filteredSchueler = inklusionsSchueler.filter(schueler => {
    const schule = getInklusionsSchuleById(schueler.schuleId);
    return schueler.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           schueler.klasse.toLowerCase().includes(searchTerm.toLowerCase()) ||
           schueler.foerderschwerpunkt.toLowerCase().includes(searchTerm.toLowerCase()) ||
           schule?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // ✅ BETREUUNGSZEITEN HELPER
  const getBetreuungsStundenProWoche = (betreuung) => {
    let gesamtStunden = 0;
    Object.values(betreuung.zeiten).forEach(tagZeiten => {
      tagZeiten.forEach(zeitspanne => {
        const [start, end] = zeitspanne.split('-');
        const startMinutes = timeToMinutes(start);
        const endMinutes = timeToMinutes(end);
        gesamtStunden += (endMinutes - startMinutes) / 60;
      });
    });
    return gesamtStunden;
  };

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // ✅ CRUD FUNKTIONEN

  // Schulen
  const addOrUpdateSchule = (schuleData) => {
    if (editingItem) {
      setInklusionsSchulen(prev => prev.map(s => 
        s.id === editingItem.id ? { ...editingItem, ...schuleData } : s
      ));
    } else {
      const neueSchule = {
        id: Date.now(),
        ...schuleData
      };
      setInklusionsSchulen(prev => [...prev, neueSchule]);
    }
    closeModal();
  };

  const deleteSchule = (schuleId) => {
    if (window.confirm('Schule wirklich löschen? Alle zugehörigen Schüler werden ebenfalls entfernt.')) {
      // Erst Schüler der Schule löschen
      const schuelerToDelete = inklusionsSchueler.filter(s => s.schuleId === schuleId);
      schuelerToDelete.forEach(schueler => {
        deleteSchueler(schueler.id, false);
      });
      
      // Dann Schule löschen
      setInklusionsSchulen(prev => prev.filter(s => s.id !== schuleId));
    }
  };

  // Schüler
  const addOrUpdateSchueler = (schuelerData) => {
    if (editingItem) {
      setInklusionsSchueler(prev => prev.map(s => 
        s.id === editingItem.id ? { ...editingItem, ...schuelerData } : s
      ));
    } else {
      const neuerSchueler = {
        id: Date.now(),
        ...schuelerData
      };
      setInklusionsSchueler(prev => [...prev, neuerSchueler]);
    }
    closeModal();
  };

  const deleteSchueler = (schuelerId, askConfirmation = true) => {
    if (!askConfirmation || window.confirm('Schüler wirklich löschen? Alle Betreuungszeiten gehen verloren.')) {
      // Betreuungszeiten löschen
      setInklusionsBetreuungen(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          const [, keySchuelerId] = key.split('_');
          if (parseInt(keySchuelerId) === schuelerId) {
            delete updated[key];
          }
        });
        return updated;
      });
      
      // Schüler löschen
      setInklusionsSchueler(prev => prev.filter(s => s.id !== schuelerId));
    }
  };

  // Betreuungen
  const addOrUpdateBetreuung = (betreuungData) => {
    const key = `${betreuungData.personId}_${betreuungData.schuelerId}`;
    
    setInklusionsBetreuungen(prev => ({
      ...prev,
      [key]: {
        ...betreuungData,
        zeiten: betreuungData.zeiten || {
          montag: [],
          dienstag: [],
          mittwoch: [],
          donnerstag: [],
          freitag: []
        }
      }
    }));
    
    // Sync Personal-Stundenpläne
    syncPersonalStundenplaene();
    closeModal();
  };

  const deleteBetreuung = (personId, schuelerId) => {
    const key = `${personId}_${schuelerId}`;
    if (window.confirm('Betreuung wirklich löschen? Alle Zeiten gehen verloren.')) {
      setInklusionsBetreuungen(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
      syncPersonalStundenplaene();
    }
  };

  // ✅ MODAL FUNKTIONEN
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
    setSelectedSchueler(null);
  };

  // ✅ PDF EXPORT
  const exportSchulePDF = (schuleId) => {
    const schule = getInklusionsSchuleById(schuleId);
    if (!schule) return;

    const schuelerDerSchule = inklusionsSchueler.filter(s => s.schuleId === schuleId);
    
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`🏫 Inklusions-Übersicht`, 20, 25);
      doc.text(schule.name, 20, 35);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Erstellt: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}`, 20, 45);
      
      // Schul-Info
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Kontakt:', 20, 60);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Ansprechpartner: ${schule.ansprechpartner}`, 20, 70);
      doc.text(`Telefon: ${schule.telefon}`, 20, 77);
      doc.text(`E-Mail: ${schule.email}`, 20, 84);
      doc.text(`Adresse: ${schule.adresse}`, 20, 91);

      let yPos = 105;

      // Statistiken
      const gesamtSchueler = schuelerDerSchule.length;
      const gesamtPersonal = new Set(Object.values(inklusionsBetreuungen)
        .filter(b => schuelerDerSchule.some(s => s.id === b.schuelerId))
        .map(b => b.personId)).size;
      const gesamtStunden = Object.values(inklusionsBetreuungen)
        .filter(b => schuelerDerSchule.some(s => s.id === b.schuelerId))
        .reduce((sum, b) => sum + getBetreuungsStundenProWoche(b), 0);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Übersicht:', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`👨‍🎓 Betreute Schüler: ${gesamtSchueler}`, 20, yPos);
      yPos += 7;
      doc.text(`👥 Eingesetztes Personal: ${gesamtPersonal}`, 20, yPos);
      yPos += 7;
      doc.text(`⏰ Gesamt-Wochenstunden: ${gesamtStunden.toFixed(1)}`, 20, yPos);
      yPos += 15;

      // Schüler-Details
      if (schuelerDerSchule.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Schüler-Details:', 20, yPos);
        yPos += 10;
        
        schuelerDerSchule.forEach(schueler => {
          const betreuungen = getBetreuungenFuerSchueler(schueler.id);
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(`• ${schueler.name} (${schueler.klasse})`, 25, yPos);
          yPos += 7;
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(`  Förderschwerpunkt: ${schueler.foerderschwerpunkt}`, 25, yPos);
          yPos += 5;
          
          Object.values(betreuungen).forEach(betreuung => {
            const person = betreuung.person;
            const stunden = getBetreuungsStundenProWoche(betreuung);
            
            doc.text(`  Betreuer: ${person.name} (${person.typ}) - ${stunden.toFixed(1)} Std/Woche`, 25, yPos);
            yPos += 5;
            
            // Zeiten
            const zeiten = [];
            Object.entries(betreuung.zeiten).forEach(([tag, tagZeiten]) => {
              if (tagZeiten.length > 0) {
                const tagName = wochentagsNamen[wochentage.indexOf(tag)].substring(0, 2);
                zeiten.push(`${tagName}: ${tagZeiten.join(', ')}`);
              }
            });
            
            if (zeiten.length > 0) {
              doc.text(`  Zeiten: ${zeiten.join(' | ')}`, 25, yPos);
              yPos += 5;
            }
          });
          
          if (schueler.bemerkungen) {
            doc.text(`  Bemerkung: ${schueler.bemerkungen}`, 25, yPos);
            yPos += 5;
          }
          
          yPos += 5; // Abstand zwischen Schülern
          
          // Seitenumbruch bei Bedarf
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
        });
      }

      // Footer
      doc.setFontSize(8);
      doc.text('Automatisch generiert vom Master-Plan System • Inklusions-Modul', 20, 285);

      const fileName = `Inklusion_${schule.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      alert(`✅ PDF für ${schule.name} erfolgreich erstellt!`);
    } catch (error) {
      console.error('PDF-Export-Fehler:', error);
      alert('❌ Fehler beim PDF-Export!');
    }
  };

  // ✅ MODAL KOMPONENTEN

  // Schule Modal
  const SchuleModal = () => {
    const [formData, setFormData] = useState(editingItem || {
      name: '',
      schulform: 'Grundschule',
      adresse: '',
      telefon: '',
      email: '',
      ansprechpartner: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      addOrUpdateSchule(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingItem ? 'Schule bearbeiten' : 'Neue externe Schule'}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schulname</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. Grundschule Am Park"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schulform</label>
                <select
                  value={formData.schulform}
                  onChange={(e) => setFormData({ ...formData, schulform: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Grundschule">Grundschule</option>
                  <option value="Hauptschule">Hauptschule</option>
                  <option value="Realschule">Realschule</option>
                  <option value="Gymnasium">Gymnasium</option>
                  <option value="Gesamtschule">Gesamtschule</option>
                  <option value="Berufsschule">Berufsschule</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Straße, PLZ Ort"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                <input
                  type="tel"
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0531-12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-Mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="info@schule.de"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ansprechpartner</label>
              <input
                type="text"
                value={formData.ansprechpartner}
                onChange={(e) => setFormData({ ...formData, ansprechpartner: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Frau/Herr Name"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {editingItem ? 'Speichern' : 'Erstellen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Schüler Modal
  const SchuelerModal = () => {
    const [formData, setFormData] = useState(editingItem || {
      name: '',
      klasse: '',
      schuleId: '',
      geburtsdatum: '',
      foerderschwerpunkt: 'Lernen',
      bemerkungen: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      addOrUpdateSchueler({
        ...formData,
        schuleId: parseInt(formData.schuleId)
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingItem ? 'Schüler bearbeiten' : 'Neuer Inklusionsschüler'}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name des Schülers</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Vor- und Nachname"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Klasse</label>
                <input
                  type="text"
                  value={formData.klasse}
                  onChange={(e) => setFormData({ ...formData, klasse: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. 3a, 7b"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Externe Schule</label>
                <select
                  value={formData.schuleId}
                  onChange={(e) => setFormData({ ...formData, schuleId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Schule auswählen...</option>
                  {inklusionsSchulen.map(schule => (
                    <option key={schule.id} value={schule.id}>{schule.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Geburtsdatum</label>
                <input
                  type="date"
                  value={formData.geburtsdatum}
                  onChange={(e) => setFormData({ ...formData, geburtsdatum: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Förderschwerpunkt</label>
              <select
                value={formData.foerderschwerpunkt}
                onChange={(e) => setFormData({ ...formData, foerderschwerpunkt: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Lernen">Lernen</option>
                <option value="Geistige Entwicklung">Geistige Entwicklung</option>
                <option value="Körperliche und motorische Entwicklung">Körperliche und motorische Entwicklung</option>
                <option value="Emotionale und soziale Entwicklung">Emotionale und soziale Entwicklung</option>
                <option value="Sprache">Sprache</option>
                <option value="Hören">Hören</option>
                <option value="Sehen">Sehen</option>
                <option value="Autismus-Spektrum-Störung">Autismus-Spektrum-Störung</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bemerkungen</label>
              <textarea
                value={formData.bemerkungen}
                onChange={(e) => setFormData({ ...formData, bemerkungen: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Besondere Bedürfnisse, Therapien, etc."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {editingItem ? 'Speichern' : 'Erstellen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Betreuung Modal
  const BetreuungModal = () => {
    const [formData, setFormData] = useState(editingItem || {
      personId: '',
      schuelerId: selectedSchueler?.id || '',
      wochenstunden: '',
      notizen: '',
      zeiten: {
        montag: [],
        dienstag: [],
        mittwoch: [],
        donnerstag: [],
        freitag: []
      }
    });

    const [currentTag, setCurrentTag] = useState('montag');
    const [zeitEingabe, setZeitEingabe] = useState({ start: '', end: '' });

    const addZeit = () => {
      if (zeitEingabe.start && zeitEingabe.end) {
        const neueZeit = `${zeitEingabe.start}-${zeitEingabe.end}`;
        setFormData(prev => ({
          ...prev,
          zeiten: {
            ...prev.zeiten,
            [currentTag]: [...prev.zeiten[currentTag], neueZeit]
          }
        }));
        setZeitEingabe({ start: '', end: '' });
      }
    };

    const removeZeit = (tag, index) => {
      setFormData(prev => ({
        ...prev,
        zeiten: {
          ...prev.zeiten,
          [tag]: prev.zeiten[tag].filter((_, i) => i !== index)
        }
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      addOrUpdateBetreuung({
        ...formData,
        personId: parseInt(formData.personId),
        schuelerId: parseInt(formData.schuelerId),
        wochenstunden: parseFloat(formData.wochenstunden)
      });
    };

    const verfuegbarePersonen = personalMitStatus.filter(p => 
      ['PF', 'LK', 'LiVD', 'TP'].includes(p.typ) && p.aktiv
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingItem ? 'Betreuung bearbeiten' : 'Neue Betreuung'}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Betreuungsperson</label>
                <select
                  value={formData.personId}
                  onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Person auswählen...</option>
                  {verfuegbarePersonen.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.name} ({person.typ})
                      {person.abwesend && ' - ABWESEND'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schüler</label>
                <select
                  value={formData.schuelerId}
                  onChange={(e) => setFormData({ ...formData, schuelerId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Schüler auswählen...</option>
                  {inklusionsSchueler.map(schueler => {
                    const schule = getInklusionsSchuleById(schueler.schuleId);
                    return (
                      <option key={schueler.id} value={schueler.id}>
                        {schueler.name} ({schueler.klasse}) - {schule?.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wochenstunden (geplant)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="25"
                  value={formData.wochenstunden}
                  onChange={(e) => setFormData({ ...formData, wochenstunden: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. 8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notizen</label>
                <input
                  type="text"
                  value={formData.notizen}
                  onChange={(e) => setFormData({ ...formData, notizen: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. Fokus auf Selbstständigkeit"
                />
              </div>
            </div>

            {/* Betreuungszeiten */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Betreuungszeiten</h4>
              
              {/* Wochentag-Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {wochentage.map((tag, index) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCurrentTag(tag)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      currentTag === tag
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {wochentagsNamen[index]}
                  </button>
                ))}
              </div>

              {/* Zeit hinzufügen */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h5 className="font-medium text-gray-900 mb-3">
                  Zeit für {wochentagsNamen[wochentage.indexOf(currentTag)]} hinzufügen
                </h5>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={zeitEingabe.start}
                    onChange={(e) => setZeitEingabe({ ...zeitEingabe, start: e.target.value })}
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span>bis</span>
                  <input
                    type="time"
                    value={zeitEingabe.end}
                    onChange={(e) => setZeitEingabe({ ...zeitEingabe, end: e.target.value })}
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addZeit}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Hinzufügen
                  </button>
                </div>
              </div>

              {/* Aktuelle Zeiten anzeigen */}
              <div className="grid grid-cols-5 gap-3">
                {wochentage.map((tag, index) => (
                  <div key={tag} className="bg-white border border-gray-200 rounded-lg p-3">
                    <h6 className="font-medium text-gray-900 text-sm mb-2">
                      {wochentagsNamen[index]}
                    </h6>
                    <div className="space-y-1">
                      {formData.zeiten[tag].map((zeit, zeitIndex) => (
                        <div key={zeitIndex} className="flex items-center justify-between bg-blue-50 text-blue-800 px-2 py-1 rounded text-xs">
                          <span>{zeit}</span>
                          <button
                            type="button"
                            onClick={() => removeZeit(tag, zeitIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {formData.zeiten[tag].length === 0 && (
                        <div className="text-gray-400 text-xs">Keine Zeiten</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {editingItem ? 'Speichern' : 'Erstellen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ✅ MAIN RENDER
  return (
    <div className="module-container">
      <div className="module-header">
        <h1 className="module-title">❤️ Inklusions-Verwaltung</h1>
        <p className="module-subtitle">Sonderpädagogische Grundversorgung an externen Schulen</p>
        <p className="text-sm text-green-600 mt-1">
          ✅ Vollständig implementiert: CRUD, PDF-Export, Personal-Sync
        </p>
      </div>

      {/* Actions & Search */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Schüler, Schule oder Förderschwerpunkt suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => openModal('schule')}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={18} />
              Neue Schule
            </button>
            <button 
              onClick={() => openModal('schueler')}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={18} />
              Neuer Schüler
            </button>
            <button 
              onClick={() => openModal('betreuung')}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus size={18} />
              Neue Betreuung
            </button>
          </div>
        </div>

        {/* Statistiken */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-800">{inklusionsSchueler.length}</div>
            <div className="text-sm text-blue-600">Betreute Schüler</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-800">{inklusionsSchulen.length}</div>
            <div className="text-sm text-green-600">Externe Schulen</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-800">
              {Object.values(inklusionsBetreuungen).reduce((sum, b) => sum + getBetreuungsStundenProWoche(b), 0).toFixed(1)}
            </div>
            <div className="text-sm text-purple-600">Gesamt-Stunden/Woche</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-800">
              {new Set(Object.values(inklusionsBetreuungen).map(b => b.personId)).size}
            </div>
            <div className="text-sm text-orange-600">Aktive Betreuer</div>
          </div>
        </div>

        {/* Schüler Liste */}
        <div className="space-y-6">
          {filteredSchueler.map(schueler => {
            const schule = getInklusionsSchuleById(schueler.schuleId);
            const betreuungen = getBetreuungenFuerSchueler(schueler.id);
            const isExpanded = expandedSchueler === schueler.id;

            return (
              <div key={schueler.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                {/* Schüler Header */}
                <div 
                  className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 cursor-pointer"
                  onClick={() => setExpandedSchueler(isExpanded ? null : schueler.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {schueler.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{schueler.name}</h3>
                        <p className="text-gray-600">
                          Klasse {schueler.klasse} • {schule?.name} • {schueler.foerderschwerpunkt}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {Object.keys(betreuungen).length}
                        </div>
                        <div className="text-sm text-gray-600">Betreuungen</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSchueler(schueler);
                            openModal('betreuung');
                          }}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          title="Betreuung hinzufügen"
                        >
                          <Plus size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal('schueler', schueler);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Schüler bearbeiten"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSchueler(schueler.id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Schüler löschen"
                        >
                          <Trash2 size={18} />
                        </button>
                        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Erweiterte Details */}
                {isExpanded && (
                  <div className="p-6 bg-white border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Betreuungen */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Betreuungen</h4>
                        {Object.keys(betreuungen).length === 0 ? (
                          <div className="text-center py-6 text-gray-500">
                            <User size={32} className="mx-auto mb-2 opacity-50" />
                            <p>Noch keine Betreuung zugeordnet</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {Object.values(betreuungen).map((betreuung, index) => {
                              const stunden = getBetreuungsStundenProWoche(betreuung);
                              
                              return (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {betreuung.person.name}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {betreuung.person.typ} • {stunden.toFixed(1)} Std/Woche
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => deleteBetreuung(betreuung.personId, schueler.id)}
                                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                  
                                  {/* Zeiten */}
                                  <div className="grid grid-cols-5 gap-2">
                                    {wochentage.map((tag, tagIndex) => (
                                      <div key={tag} className="text-center">
                                        <div className="text-xs font-medium text-gray-700 mb-1">
                                          {wochentagsNamen[tagIndex].substring(0, 2)}
                                        </div>
                                        <div className="space-y-1">
                                          {betreuung.zeiten[tag].map((zeit, zeitIndex) => (
                                            <div key={zeitIndex} className="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">
                                              {zeit.split('-')[0]}
                                            </div>
                                          ))}
                                          {betreuung.zeiten[tag].length === 0 && (
                                            <div className="text-gray-400 text-xs">-</div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {betreuung.notizen && (
                                    <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                      💡 {betreuung.notizen}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Schüler-Details */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Schüler-Information</h4>
                        <div className="space-y-3">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Geburtsdatum:</span>
                                <div className="text-gray-600">
                                  {schueler.geburtsdatum ? new Date(schueler.geburtsdatum).toLocaleDateString('de-DE') : 'Nicht angegeben'}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Förderschwerpunkt:</span>
                                <div className="text-gray-600">{schueler.foerderschwerpunkt}</div>
                              </div>
                            </div>
                          </div>
                          
                          {schueler.bemerkungen && (
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                              <div className="font-medium text-yellow-800 mb-1">Bemerkungen:</div>
                              <div className="text-yellow-700 text-sm">{schueler.bemerkungen}</div>
                            </div>
                          )}

                          {/* Schul-Information */}
                          {schule && (
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                              <div className="font-medium text-blue-800 mb-2">Externe Schule:</div>
                              <div className="text-blue-700 text-sm space-y-1">
                                <div className="flex items-center gap-2">
                                  <MapPin size={14} />
                                  {schule.adresse}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone size={14} />
                                  {schule.telefon}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail size={14} />
                                  {schule.email}
                                </div>
                                <div>Ansprechpartner: {schule.ansprechpartner}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredSchueler.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Keine Schüler gefunden</h3>
              <p>Versuchen Sie einen anderen Suchbegriff oder fügen Sie einen neuen Schüler hinzu.</p>
            </div>
          )}
        </div>
      </div>

      {/* Externe Schulen Übersicht */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Externe Schulen ({inklusionsSchulen.length})</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {inklusionsSchulen.map(schule => {
            const schuelerCount = inklusionsSchueler.filter(s => s.schuleId === schule.id).length;
            
            return (
              <div key={schule.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">{schule.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {schuelerCount} Schüler
                    </span>
                    <button
                      onClick={() => exportSchulePDF(schule.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="PDF exportieren"
                    >
                      <FileText size={16} />
                    </button>
                    <button
                      onClick={() => openModal('schule', schule)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Bearbeiten"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteSchule(schule.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Löschen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} />
                    <span>{schule.adresse}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} />
                    <span>{schule.telefon}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={12} />
                    <span>{schule.email}</span>
                  </div>
                  <div>Ansprechpartner: {schule.ansprechpartner}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showModal && modalType === 'schule' && <SchuleModal />}
      {showModal && modalType === 'schueler' && <SchuelerModal />}
      {showModal && modalType === 'betreuung' && <BetreuungModal />}
    </div>
  );
};

export default InklusionModule;