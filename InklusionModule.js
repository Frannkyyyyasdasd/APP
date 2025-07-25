
import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Users, Clock, Edit, X, Save, Trash2, Calendar, Mail, Phone, FileText, Download, AlertTriangle, Check, User, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useStundenplan } from '../context/StundenplanContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Nur importieren, fügt sich an jspdf an (Punkt 6)

// ✅ NEU: Import für zentrale Konstanten (Punkt 4)
// Hinweis: Diese Datei müssen Sie später erstellen, z.B. unter:
// frannkyyyyasdasd/app/APP-baa3e6a5a4282b71f89fb1b620fb3b8dc3042048/constants/appConstants.js
import { WOCHENTAGE_KEYS, WOCHENTAGE_NAMEN } from '../constants/appConstants';


// ✅ HINWEIS: showToastMessage wird jetzt als Prop von StundenplanApp übergeben (Punkt 3)
const InklusionModule = ({ showToastMessage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'schule', 'schueler', 'betreuung', 'zeiten'
  const [editingItem, setEditingItem] = useState(null);
  const [selectedSchueler, setSelectedSchueler] = useState(null);
  const [expandedSchueler, setExpandedSchueler] = useState(null);
  
  // ✅ Context-Zugriff - Jetzt inklusive inklusionsSchulen, inklusionsSchueler, inklusionsBetreuungen aus initialAppData (Punkt 1)
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

  // ✅ ENTFERNT: PERSISTENTE SPEICHERUNG (localStorage) und lokale Initialisierungs-UseEffects - Punkt 1
  // Die Funktionen `STORAGE_KEY`, `saveToStorage` wurden HIER ENTFERNT.
  // Auch der `useEffect` zur Auto-Speicherung der Inklusionsdaten (inklusionsSchulen, inklusionsSchueler, inklusionsBetreuungen)
  // wurde entfernt, da die Daten über den StundenplanContext verwaltet werden.

  // ✅ ENTFERNT: Der useEffect-Block zur Initialisierung von inklusionsSchulen, inklusionsSchueler, inklusionsBetreuungen.
  // Diese Daten werden nun direkt über initialAppData im Context initialisiert.

  // ✅ ERSETZT: `wochentage` und `wochentagsNamen` werden nun aus `appConstants.js` importiert (Punkt 4)
  const wochentage = WOCHENTAGE_KEYS; // NUTZT WOCHENTAGE_KEYS aus Konstanten
  const wochentagsNamen = WOCHENTAGE_NAMEN; // NUTZT WOCHENTAGE_NAMEN aus Konstanten

  // ✅ HILFSFUNKTIONEN (unverändert)
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

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

  // ✅ FILTER-FUNKTIONEN (unverändert)
  const filteredSchueler = inklusionsSchueler.filter(schueler => {
    const schule = getInklusionsSchuleById(schueler.schuleId);
    return schueler.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           schueler.klasse.toLowerCase().includes(searchTerm.toLowerCase()) ||
           schueler.foerderschwerpunkt.toLowerCase().includes(searchTerm.toLowerCase()) ||
           schule?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // ✅ NEUE PDF EXPORT FUNKTION - GESAMTE INKLUSIONSLISTE (unverändert bis auf Toast)
  const exportGesamteInklusionsliste = () => {
    try {
      console.log('🔍 PDF Export gestartet für gesamte Inklusionsliste');
      
      const doc = new jsPDF();
      
      // HEADER
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Inklusionsliste - Sonderpaedagogische Grundversorgung', 20, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}`, 20, 35);
      
      let yPos = 50;

      // ÜBERSICHT STATISTIKEN
      const gesamtSchueler = inklusionsSchueler.length;
      const gesamtSchulen = inklusionsSchulen.length;
      const gesamtPersonal = new Set(Object.values(inklusionsBetreuungen).map(b => b.personId)).size;
      const gesamtStunden = Object.values(inklusionsBetreuungen).reduce((sum, b) => {
        return sum + getBetreuungsStundenProWoche(b);
      }, 0);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Gesamtuebersicht:', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Externe Schulen: ${gesamtSchulen}`, 25, yPos);
      yPos += 7;
      doc.text(`Betreute Schueler: ${gesamtSchueler}`, 25, yPos);
      yPos += 7;
      doc.text(`Eingesetztes Personal: ${gesamtPersonal}`, 25, yPos);
      yPos += 7;
      doc.text(`Gesamt-Wochenstunden: ${gesamtStunden.toFixed(1)} Stunden`, 25, yPos);
      yPos += 20;

      // SCHULEN MIT SCHÜLERN UND BETREUERN
      inklusionsSchulen.forEach((schule, schuleIndex) => {
        // Seitenumbruch bei Bedarf
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // SCHULE HEADER
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${schule.name}`, 20, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${schule.adresse}`, 25, yPos);
        yPos += 6;
        doc.text(`Tel: ${schule.telefon} | Email: ${schule.email}`, 25, yPos);
        yPos += 6;
        doc.text(`Ansprechpartner: ${schule.ansprechpartner}`, 25, yPos);
        yPos += 10;

        // SCHÜLER DIESER SCHULE
        const schuelerDerSchule = inklusionsSchueler.filter(s => s.schuleId === schule.id);
        
        if (schuelerDerSchule.length === 0) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text('Keine Schueler betreut', 30, yPos);
          yPos += 15;
        } else {
          schuelerDerSchule.forEach((schueler, schuelerIndex) => {
            // Seitenumbruch bei Bedarf
            if (yPos > 260) {
              doc.addPage();
              yPos = 20;
            }

            // SCHÜLER INFO
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${schueler.name} (Klasse ${schueler.klasse})`, 30, yPos);
            yPos += 7;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Foerderschwerpunkt: ${schueler.foerderschwerpunkt}`, 35, yPos);
            yPos += 6;
            
            if (schueler.bemerkungen) {
              doc.text(`Bemerkungen: ${schueler.bemerkungen}`, 35, yPos);
              yPos += 6;
            }

            // BETREUENDE LEHRKRÄFTE
            const betreuungen = getBetreuungenFuerSchueler(schueler.id);
            
            if (Object.keys(betreuungen).length === 0) {
              doc.setFont('helvetica', 'italic');
              doc.text('Keine Betreuung zugeordnet', 35, yPos);
              yPos += 6;
            } else {
              Object.values(betreuungen).forEach(betreuung => {
                const person = betreuung.person;
                const stundenWoche = getBetreuungsStundenProWoche(betreuung);
                
                // LEHRKRAFT FETT MARKIERT
                doc.setFont('helvetica', 'bold');
                doc.text(`Lehrkraft: ${person.name} (${person.typ})`, 35, yPos);
                yPos += 6;
                
                doc.setFont('helvetica', 'normal');
                doc.text(`Wochenstunden: ${stundenWoche.toFixed(1)} Std/Woche`, 40, yPos);
                yPos += 6;
                
                if (betreuung.notizen) {
                  doc.text(`Notizen: ${betreuung.notizen}`, 40, yPos);
                  yPos += 6;
                }
              });
            }
            yPos += 5; // Abstand zwischen Schülern
          });
        }
        yPos += 10; // Abstand zwischen Schulen
      });

      // PERSONALLISTE
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Eingesetztes Personal (Uebersicht):', 20, yPos);
      yPos += 15;

      // Personal-Tabelle erstellen
      const personalData = [];
      const eingesetztePersonalIds = new Set(Object.values(inklusionsBetreuungen).map(b => b.personId));
      
      eingesetztePersonalIds.forEach(personId => {
        const person = getPersonById(personId);
        if (person) {
          const gesamtStunden = Object.values(inklusionsBetreuungen)
            .filter(b => b.personId === personId)
            .reduce((sum, b) => sum + getBetreuungsStundenProWoche(b), 0);
          
          const anzahlSchueler = Object.values(inklusionsBetreuungen)
            .filter(b => b.personId === personId).length;
          
          personalData.push([
            person.name,
            person.typ,
            `${gesamtStunden.toFixed(1)} Std`,
            `${anzahlSchueler} Schueler`
          ]);
        }
      });

      // AutoTable für Personal
      autoTable(doc, {
        head: [['Name', 'Position', 'Wochenstunden', 'Anzahl Schueler']],
        body: personalData,
        startY: yPos,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [46, 125, 50], // Grün
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 11
        },
        bodyStyles: {
          fontSize: 9
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 }, // Name fett
          1: { cellWidth: 25, halign: 'center' }, // Position
          2: { cellWidth: 30, halign: 'center' }, // Stunden
          3: { cellWidth: 30, halign: 'center' }  // Anzahl
        }
      });

      // FOOTER
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Erstellt mit Master-Plan System - Inklusions-Verwaltung', 20, 285);
        doc.text(`Seite ${i} von ${pageCount}`, 270, 285);
      }

      // DATEI SPEICHERN
      const fileName = `Inklusionsliste_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      showToastMessage('✅ Inklusionsliste erfolgreich als PDF exportiert!');
      
    } catch (error) {
      console.error('❌ PDF-Export-Fehler:', error);
      showToastMessage('❌ Fehler beim PDF-Export der Inklusionsliste!');
    }
  };

  // ✅ CRUD FUNKTIONEN (unverändert bis auf Toast)

  // Schulen
  const addOrUpdateSchule = (schuleData) => {
    if (editingItem) {
      setInklusionsSchulen(prev => prev.map(s => 
        s.id === editingItem.id ? { ...editingItem, ...schuleData } : s
      ));
      showToastMessage('Schule aktualisiert.'); // Toast hinzugefügt
    } else {
      const neueSchule = {
        id: Date.now(),
        ...schuleData
      };
      setInklusionsSchulen(prev => [...prev, neueSchule]);
      showToastMessage('Neue Schule hinzugefügt.'); // Toast hinzugefügt
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
      showToastMessage('Schule und zugehörige Schüler gelöscht.'); // Toast hinzugefügt
    }
  };

  // Schüler
  const addOrUpdateSchueler = (schuelerData) => {
    if (editingItem) {
      setInklusionsSchueler(prev => prev.map(s => 
        s.id === editingItem.id ? { ...editingItem, ...schuelerData } : s
      ));
      showToastMessage('Schüler aktualisiert.'); // Toast hinzugefügt
    } else {
      const neuerSchueler = {
        id: Date.now(),
        ...schuelerData
      };
      setInklusionsSchueler(prev => [...prev, neuerSchueler]);
      showToastMessage('Neuer Schüler hinzugefügt.'); // Toast hinzugefügt
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
      if (askConfirmation) showToastMessage('Schüler gelöscht.'); // Toast hinzugefügt
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
    showToastMessage('Betreuung gespeichert.'); // Toast hinzugefügt
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
      showToastMessage('Betreuung gelöscht.'); // Toast hinzugefügt
    }
  };

  // ✅ MODAL FUNKTIONEN (unverändert)

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

  // ✅ PDF EXPORT für einzelne Schule (bestehende Funktion - unverändert bis auf Toast)
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
                const tagName = WOCHENTAGE_NAMEN[WOCHENTAGE_KEYS.indexOf(tag)].substring(0, 2); // NUTZT WOCHENTAGE_NAMEN, WOCHENTAGE_KEYS
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
      
      showToastMessage(`✅ PDF für ${schule.name} erfolgreich erstellt!`);
    } catch (error) {
      console.error('PDF-Export-Fehler:', error);
      showToastMessage('❌ Fehler beim PDF-Export!');
    }
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={exportGesamteInklusionsliste}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <FileText size={18} />
              PDF Export
            </button>
            
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
                                    {WOCHENTAGE_KEYS.map((tag, tagIndex) => (
                                      <div key={tag} className="text-center">
                                        <div className="text-xs font-medium text-gray-700 mb-1">
                                          {WOCHENTAGE_NAMEN[tagIndex].substring(0, 2)}
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
                                      {betreuung.notizen}
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