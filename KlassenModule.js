import React, { useState } from 'react';
import { Search, Plus, MapPin, Users, ChevronDown, ChevronUp, Edit, Eye, Mail, Phone, Home, Clock, AlertTriangle, X, Save, Trash2, User, Printer, Download, Calendar, Settings, Filter } from 'lucide-react';
import { useStundenplan } from '../context/StundenplanContext';

// ✅ PDF INTEGRATION - KORREKTE IMPORTS
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const KlassenModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedKlasse, setExpandedKlasse] = useState(null);
  const [showNewKlasseModal, setShowNewKlasseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPersonSearchModal, setShowPersonSearchModal] = useState(false);
  const [editingKlasse, setEditingKlasse] = useState(null);
  const [currentKlasseForPersonSearch, setCurrentKlasseForPersonSearch] = useState(null);
  const [draggedPerson, setDraggedPerson] = useState(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeModalData, setTimeModalData] = useState(null);
  const [personSearchTerm, setPersonSearchTerm] = useState('');
  const [filterStufe, setFilterStufe] = useState('alle');
  const [filterStandort, setFilterStandort] = useState('alle');

  // ✅ NEU: LÖSCH-BESTÄTIGUNG MODAL STATES
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState(null);

  // ✅ Context-Zugriff
  const { 
    getPersonalMitStatus, 
    getPersonById,
    masterStundenplaene,
    setMasterStundenplaene,
    syncPersonalStundenplaene
  } = useStundenplan();
  
  const personalMitStatus = getPersonalMitStatus();

  // ✅ PERSISTENTE SPEICHERUNG
  const STORAGE_KEY = 'klassen_module_data_v2';
  
  const saveToStorage = (data) => {
    try {
      const saveData = {
        ...data,
        timestamp: new Date().toISOString(),
        version: '2.0'
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
      console.log('✅ Klassen-Daten gespeichert');
    } catch (error) {
      console.error('❌ Speicherfehler:', error);
    }
  };

  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('✅ Klassen-Daten geladen');
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('❌ Ladefehler:', error);
      return null;
    }
  };

  // ✅ Erweiterte Klassen-Datenstruktur mit persistenter Speicherung (OHNE Beispieldaten)
  const [klassen, setKlassen] = useState(() => {
    const saved = loadFromStorage();
    return saved?.klassen || [
      {
        id: '1a',
        klasse: '1a',
        stufe: 'Primarstufe',
        schuelerzahl: 18,
        standort: 'OBS',
        email: '1a@obs-braunschweig.de',
        raum: 'R-103',
        telefon: '0531-12345-103',
        klassenlehrkraft: 'Anna Schmidt',
        zugeordnetePersonen: [], // ✅ LEER - keine Beispieldaten
        bemerkungen: 'Integrationsklasse mit erhöhtem Förderbedarf'
      },
      {
        id: '2a',
        klasse: '2a',
        stufe: 'Primarstufe',
        schuelerzahl: 20,
        standort: 'OBS',
        email: '2a@obs-braunschweig.de',
        raum: 'R-204',
        telefon: '0531-12345-204',
        klassenlehrkraft: 'Peter Hoffmann',
        zugeordnetePersonen: [], // ✅ LEER - keine Beispieldaten
        bemerkungen: ''
      },
      {
        id: '6a',
        klasse: '6a',
        stufe: 'Sekundarstufe I',
        schuelerzahl: 15,
        standort: 'Johannes Selenka Schule',
        email: '6a@jss-braunschweig.de',
        raum: 'JSS-301',
        telefon: '0531-54321-301',
        klassenlehrkraft: 'Thomas Mueller',
        zugeordnetePersonen: [], // ✅ LEER - keine Beispieldaten
        bemerkungen: 'Kooperationsklasse - externe Betreuung erforderlich'
      },
      {
        id: '9b',
        klasse: '9b',
        stufe: 'Sekundarstufe I',
        schuelerzahl: 22,
        standort: 'OBS',
        email: '9b@obs-braunschweig.de',
        raum: 'R-901',
        telefon: '0531-12345-901',
        klassenlehrkraft: 'Claudia Neumann',
        zugeordnetePersonen: [], // ✅ LEER - keine Beispieldaten
        bemerkungen: 'Prüfungsklasse - verstärkte Vorbereitung'
      },
      {
        id: '5e',
        klasse: '5e',
        stufe: 'Sekundarstufe I',
        schuelerzahl: 16,
        standort: 'Sidonienstraße',
        email: '5e@sidonien-bs.de',
        raum: 'SID-205',
        telefon: '0531-99999-205',
        klassenlehrkraft: 'Sarah Weber',
        zugeordnetePersonen: [], // ✅ LEER - keine Beispieldaten
        bemerkungen: 'Außenstelle - besondere Betreuung'
      }
    ];
  });

  // ✅ Auto-Speicherung bei Klassen-Änderungen
  React.useEffect(() => {
    saveToStorage({ klassen });
  }, [klassen]);

  const wochentage = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag'];
  const wochentagsNamen = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

  // ✅ VERBESSERTE ZEIT-STRUKTUR mit intelligenter Pausen-Logik
  const CHART_CONFIG = {
    startHour: 8,
    endHour: 16,
    totalMinutes: (16 - 8) * 60,
    pixelsPerHour: 45,
    totalHeight: (16 - 8) * 45
  };

  // ✅ INTELLIGENTE ZEITSLOT-DEFINITION
  const getZeitslotDefinition = () => {
    return [
      { zeit: '08:00-08:45', name: '1. Block (1/2)', typ: 'unterricht', block: 1, farbe: 'bg-blue-100' },
      { zeit: '08:45-09:30', name: '1. Block (2/2)', typ: 'unterricht', block: 1, farbe: 'bg-blue-100' },
      { zeit: '09:30-09:50', name: '1. Pause', typ: 'pause', block: 'P1', farbe: 'bg-orange-100' },
      { zeit: '09:50-10:35', name: '2. Block (1/2)', typ: 'unterricht', block: 2, farbe: 'bg-blue-100' },
      { zeit: '10:35-11:20', name: '2. Block (2/2)', typ: 'unterricht', block: 2, farbe: 'bg-blue-100' },
      { zeit: '11:20-11:40', name: '2. Pause', typ: 'pause', block: 'P2', farbe: 'bg-orange-100' },
      { zeit: '11:40-12:50', name: 'Mittagessen', typ: 'mittagessen', block: 'M', farbe: 'bg-green-100' },
      { zeit: '12:50-13:10', name: '3. Pause', typ: 'pause', block: 'P3', farbe: 'bg-orange-100' },
      { zeit: '13:10-13:55', name: '3. Block (1/2)', typ: 'unterricht', block: 3, farbe: 'bg-blue-100' },
      { zeit: '13:55-14:40', name: '3. Block (2/2)', typ: 'unterricht', block: 3, farbe: 'bg-blue-100' },
      { zeit: '14:40-15:30', name: 'Spätbetreuung', typ: 'betreuung', block: 'S', farbe: 'bg-purple-100' }
    ];
  };

  // ✅ ZEIT-HILFSFUNKTIONEN
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const timeToPixels = (timeStr) => {
    const minutes = timeToMinutes(timeStr);
    const startMinutes = CHART_CONFIG.startHour * 60;
    const relativeMinutes = minutes - startMinutes;
    return (relativeMinutes / 60) * CHART_CONFIG.pixelsPerHour;
  };

  const isValidTimeRange = (startTime, endTime) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const chartStart = CHART_CONFIG.startHour * 60;
    const chartEnd = CHART_CONFIG.endHour * 60;
    
    return startMinutes >= chartStart && 
           endMinutes <= chartEnd && 
           startMinutes < endMinutes;
  };

  const getPersonalTypInfo = (typ) => {
    const vollzeitTypen = ['P', 'PF', 'TP'];
    const unterrichtsTypen = ['LK', 'LiVD', 'LT'];
    
    return {
      isVollzeit: vollzeitTypen.includes(typ),
      isUnterricht: unterrichtsTypen.includes(typ),
      stundenTyp: vollzeitTypen.includes(typ) ? 'Vollstunden (60 Min)' : 'Unterrichtsstunden (45 Min)',
      farbe: vollzeitTypen.includes(typ) ? 'bg-green-500' : 'bg-blue-500'
    };
  };

  // ✅ MEMOIZED PERSONAL-STUNDEN für bessere Performance mit Auto-Update
  const personalStundenCache = React.useMemo(() => {
    const cache = {};
    personalMitStatus.forEach(person => {
      let gesamtStunden = 0;
      wochentage.forEach(wochentag => {
        Object.entries(masterStundenplaene).forEach(([klasseName, klassenplan]) => {
          const tagesplan = klassenplan[wochentag] || {};
          Object.entries(tagesplan).forEach(([zeitslot, personEntries]) => {
            personEntries.forEach(entry => {
              const entryPersonId = typeof entry === 'number' ? entry : entry.personId;
              if (entryPersonId === person.id) {
                if (typeof entry === 'object' && entry.startZeit && entry.endZeit) {
                  const start = timeToMinutes(entry.startZeit);
                  const end = timeToMinutes(entry.endZeit);
                  const minuten = end - start;
                  const typInfo = getPersonalTypInfo(person.typ);
                  gesamtStunden += typInfo.isVollzeit ? (minuten / 60) : (minuten / 45);
                } else {
                  const typInfo = getPersonalTypInfo(person.typ);
                  gesamtStunden += typInfo.isVollzeit ? 1 : 1;
                }
              }
            });
          });
        });
      });
      cache[person.id] = gesamtStunden;
    });
    return cache;
  }, [personalMitStatus, masterStundenplaene, klassen]);

  const berechnePersonStundenInKlasse = (person, klasseName) => {
    return personalStundenCache[person.id] || 0;
  };

  const checkKonflikte = (personId, klasse, wochentag, startZeit, endZeit, excludeId = null) => {
    const konflikte = [];
    const startMinutes = timeToMinutes(startZeit);
    const endMinutes = timeToMinutes(endZeit);
    
    Object.entries(masterStundenplaene).forEach(([andereKlasse, wochenplan]) => {
      if (andereKlasse === klasse) return;
      
      const tagesplan = wochenplan[wochentag] || {};
      Object.entries(tagesplan).forEach(([zeitslot, personEntries]) => {
        personEntries.forEach(entry => {
          const entryPersonId = typeof entry === 'number' ? entry : entry.personId;
          if (entryPersonId === personId) {
            let entryStart, entryEnd;
            if (typeof entry === 'object' && entry.startZeit && entry.endZeit) {
              entryStart = entry.startZeit;
              entryEnd = entry.endZeit;
            } else {
              [entryStart, entryEnd] = zeitslot.split('-');
            }
            
            const zeitStartMinutes = timeToMinutes(entryStart);
            const zeitEndMinutes = timeToMinutes(entryEnd);
            
            if (startMinutes < zeitEndMinutes && endMinutes > zeitStartMinutes) {
              konflikte.push({
                typ: 'andere_klasse',
                details: `${andereKlasse}: ${entryStart}-${entryEnd}`,
                schwere: 'hoch'
              });
            }
          }
        });
      });
    });

    return konflikte;
  };

  const getPersonTypColor = (typ, variant = 'light') => {
    const colors = {
      light: {
        'LT': 'bg-purple-200 text-purple-900 border-purple-400',
        'LK': 'bg-blue-200 text-blue-900 border-blue-400', 
        'PF': 'bg-emerald-200 text-emerald-900 border-emerald-400',
        'LiVD': 'bg-amber-200 text-amber-900 border-amber-400',
        'TP': 'bg-pink-200 text-pink-900 border-pink-400',
        'P': 'bg-gray-200 text-gray-900 border-gray-400'
      },
      strong: {
        'LT': 'bg-purple-700 text-white border-purple-700 shadow-md',
        'LK': 'bg-blue-700 text-white border-blue-700 shadow-md',
        'PF': 'bg-emerald-700 text-white border-emerald-700 shadow-md',
        'LiVD': 'bg-amber-700 text-white border-amber-700 shadow-md',
        'TP': 'bg-pink-700 text-white border-pink-700 shadow-md',
        'P': 'bg-gray-700 text-white border-gray-700 shadow-md'
      }
    };
    
    return colors[variant][typ] || colors[variant]['P'];
  };

  const getStufeColor = (stufe) => {
    const colors = {
      'Primarstufe': 'bg-emerald-200 text-emerald-900 border-emerald-400',
      'Sekundarstufe I': 'bg-blue-200 text-blue-900 border-blue-400',
      'Sekundarstufe II': 'bg-purple-200 text-purple-900 border-purple-400'
    };
    return colors[stufe] || 'bg-gray-200 text-gray-900 border-gray-400';
  };

  const getPersonLastName = (fullName) => {
    const parts = fullName.trim().split(' ');
    return parts[parts.length - 1];
  };

  // ✅ DRAG & DROP HANDLERS (ohne Drag-Symbol)
  const handleDragStart = (person) => {
    setDraggedPerson(person);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, klasseName, wochentag, dropY) => {
    e.preventDefault();
    if (!draggedPerson) return;
    
    const chartRect = e.currentTarget.getBoundingClientRect();
    const relativeY = dropY - chartRect.top;
    const hoursFromStart = relativeY / CHART_CONFIG.pixelsPerHour;
    const dropMinutes = CHART_CONFIG.startHour * 60 + (hoursFromStart * 60);
    const dropTime = minutesToTime(Math.round(dropMinutes));
    
    setTimeModalData({
      person: draggedPerson,
      klasseName,
      wochentag,
      defaultStart: dropTime,
      defaultEnd: minutesToTime(Math.round(dropMinutes) + 60)
    });
    setShowTimeModal(true);
    setDraggedPerson(null);
  };

  const addPersonToMasterStundenplanWithTime = (klasseName, wochentag, startZeit, endZeit, personId, bemerkung = '') => {
    const zeitslot = `${startZeit}-${endZeit}`;
    
    setMasterStundenplaene(prev => {
      const updated = { ...prev };
      
      if (!updated[klasseName]) {
        updated[klasseName] = {};
      }
      
      if (!updated[klasseName][wochentag]) {
        updated[klasseName][wochentag] = {};
      }
      
      if (!updated[klasseName][wochentag][zeitslot]) {
        updated[klasseName][wochentag][zeitslot] = [];
      }
      
      const personData = {
        personId,
        startZeit,
        endZeit,
        bemerkung,
        id: Date.now()
      };
      
      const existiert = updated[klasseName][wochentag][zeitslot].some(p => 
        (typeof p === 'number' ? p : p.personId) === personId
      );
      
      if (!existiert) {
        updated[klasseName][wochentag][zeitslot].push(personData);
      }
      
      return updated;
    });

    syncPersonalStundenplaene && syncPersonalStundenplaene();
  };

  // ✅ NEUE PROFESSIONELLE LÖSCH-FUNKTION
  const removePersonFromMasterStundenplan = (klasseName, wochentag, zeitslot, personId) => {
    const person = getPersonById(personId);
    
    setDeleteModalData({
      type: 'stundenplan',
      title: 'Person aus Stundenplan entfernen',
      message: `Möchten Sie ${person?.name || 'diese Person'} wirklich aus dem Stundenplan entfernen?`,
      details: `${klasseName} • ${wochentagsNamen[wochentage.indexOf(wochentag)]} • ${zeitslot}`,
      confirmAction: () => {
        setMasterStundenplaene(prev => {
          const updated = { ...prev };
          
          if (updated[klasseName]?.[wochentag]?.[zeitslot]) {
            updated[klasseName][wochentag][zeitslot] = updated[klasseName][wochentag][zeitslot]
              .filter(entry => {
                const entryPersonId = typeof entry === 'number' ? entry : entry.personId;
                return entryPersonId !== personId;
              });
            
            if (updated[klasseName][wochentag][zeitslot].length === 0) {
              delete updated[klasseName][wochentag][zeitslot];
            }
          }
          
          return updated;
        });

        syncPersonalStundenplaene && syncPersonalStundenplaene();
        setShowDeleteModal(false);
        setDeleteModalData(null);
      }
    });
    
    setShowDeleteModal(true);
  };

  const removePersonFromKlasse = (klasseId, personId) => {
    const person = getPersonById(personId);
    const klasse = klassen.find(k => k.id === klasseId);
    
    setDeleteModalData({
      type: 'person_from_klasse',
      title: 'Person aus Klasse entfernen',
      message: `Möchten Sie ${person?.name || 'diese Person'} wirklich aus der Klasse entfernen?`,
      details: `Klasse ${klasse?.klasse} • Diese Person wird aus der Klassen-Zuordnung entfernt`,
      confirmAction: () => {
        setKlassen(prev => prev.map(k => {
          if (k.id === klasseId) {
            return {
              ...k,
              zugeordnetePersonen: k.zugeordnetePersonen.filter(id => id !== personId)
            };
          }
          return k;
        }));
        setShowDeleteModal(false);
        setDeleteModalData(null);
      }
    });
    
    setShowDeleteModal(true);
  };

  const handleEditKlasse = (klasse) => {
    setEditingKlasse({ ...klasse });
    setShowEditModal(true);
  };

  const saveKlasseEdit = () => {
    setKlassen(prev => prev.map(k => 
      k.id === editingKlasse.id ? editingKlasse : k
    ));
    setShowEditModal(false);
    setEditingKlasse(null);
  };

  const addNewKlasse = (klasseData) => {
    const neueKlasse = {
      id: klasseData.klasse,
      ...klasseData,
      zugeordnetePersonen: []
    };
    
    setKlassen(prev => [...prev, neueKlasse]);
    
    setMasterStundenplaene(prev => ({
      ...prev,
      [klasseData.klasse]: {
        'montag': {},
        'dienstag': {},
        'mittwoch': {},
        'donnerstag': {},
        'freitag': {}
      }
    }));
  };

  const togglePersonZuordnung = (klasseId, personId, istZugeordnet) => {
    setKlassen(prev => prev.map(k => {
      if (k.id === klasseId) {
        return {
          ...k,
          zugeordnetePersonen: istZugeordnet 
            ? k.zugeordnetePersonen.filter(id => id !== personId)
            : [...k.zugeordnetePersonen, personId]
        };
      }
      return k;
    }));
  };

  // ✅ VERBESSERTE PDF EXPORT - MIT INTELLIGENTER ZEITSLOT-BEHANDLUNG
  const exportKlasseAsPDF = (klasse) => {
    try {
      console.log('🔍 PDF Export gestartet für:', klasse.klasse);
      
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = 297;
      const pageHeight = 210;
      
      // ✅ HEADER mit besserer Formatierung
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(`Stundenplan Klasse ${klasse.klasse}`, 20, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`${klasse.stufe} • ${klasse.standort} • Raum ${klasse.raum}`, 20, 35);
      doc.text(`${klasse.schuelerzahl} Schüler • Klassenlehrkraft: ${klasse.klassenlehrkraft}`, 20, 42);
      
      doc.setFontSize(10);
      doc.text(`Erstellt: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}`, 200, 35);

      // ✅ INTELLIGENTE ZEITSLOTS für PDF (nur Unterrichts- und Mittagszeiten)
      const zeitslotDefinitionen = getZeitslotDefinition();
      const pdfZeitslots = zeitslotDefinitionen.filter(slot => 
        slot.typ === 'unterricht' || slot.typ === 'mittagessen' || slot.typ === 'betreuung'
      );

      // ✅ HILFSFUNKTION: Prüft ob eine Person in einem Zeitraum eingeteilt ist
      const isPersonInZeitslot = (klassenplan, targetZeitslot) => {
        const personen = [];
        
        // Alle gespeicherten Zeitslots durchgehen
        Object.entries(klassenplan).forEach(([gespeicherterZeitslot, personEntries]) => {
          personEntries.forEach(personEntry => {
            let personId, startZeit, endZeit;
            
            // Unterscheide zwischen altem Format (nur personId) und neuem Format (mit startZeit/endZeit)
            if (typeof personEntry === 'number') {
              personId = personEntry;
              // Für alte Einträge: verwende den Zeitslot-Key
              const [start, end] = gespeicherterZeitslot.split('-');
              startZeit = start;
              endZeit = end;
            } else {
              personId = personEntry.personId;
              startZeit = personEntry.startZeit;
              endZeit = personEntry.endZeit;
            }
            
            // Prüfe ob der Target-Zeitslot innerhalb der Person-Arbeitszeit liegt
            const [targetStart, targetEnd] = targetZeitslot.split('-');
            
            if (isTimeOverlap(startZeit, endZeit, targetStart, targetEnd)) {
              const person = getPersonById(personId);
              if (person && !personen.some(p => p.id === personId)) {
                personen.push(person);
              }
            }
          });
        });
        
        return personen;
      };

      // ✅ HILFSFUNKTION: Prüft Zeitüberschneidung
      const isTimeOverlap = (start1, end1, start2, end2) => {
        const timeToMinutes = (timeStr) => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          return hours * 60 + minutes;
        };
        
        const start1Minutes = timeToMinutes(start1);
        const end1Minutes = timeToMinutes(end1);
        const start2Minutes = timeToMinutes(start2);
        const end2Minutes = timeToMinutes(end2);
        
        return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
      };

      // ✅ HEADER-ZEILE für Tabelle
      const headerRow = ['Zeit/Block'];
      wochentagsNamen.forEach(tag => headerRow.push(tag));

      // ✅ DATEN-ZEILEN generieren (nur Unterrichts- und Mittagszeiten)
      const tableData = [];
      
      pdfZeitslots.forEach(zeitslotDef => {
        const row = [zeitslotDef.zeit + (zeitslotDef.block ? ` (${zeitslotDef.block})` : '')];
        
        // Alle Wochentage durchgehen
        wochentage.forEach(wochentag => {
          const klassenplan = masterStundenplaene[klasse.klasse]?.[wochentag] || {};
          const personenInZeitslot = isPersonInZeitslot(klassenplan, zeitslotDef.zeit);
          
          if (personenInZeitslot.length === 0) {
            row.push('-');
          } else {
            const personNamen = personenInZeitslot.map(person => getPersonLastName(person.name));
            row.push(personNamen.join(', '));
          }
        });
        
        tableData.push(row);
      });

      console.log('🔍 Tabellendaten generiert:', tableData.length, 'Zeilen');

      // ✅ TABELLE mit autoTable erstellen - KORRIGIERTE VERSION
      const tableResult = autoTable(doc, {
        head: [headerRow],
        body: tableData,
        startY: 55,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          halign: 'center',
          valign: 'middle',
          lineColor: [100, 100, 100],
          lineWidth: 0.3
        },
        headStyles: {
          fillColor: [41, 128, 185], // Schönes Blau
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [50, 50, 50]
        },
        columnStyles: {
          0: { 
            halign: 'center',
            fillColor: [236, 240, 241], // Hellgrau für Zeit-Spalte
            fontStyle: 'bold',
            cellWidth: 25
          }
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        didParseCell: function(data) {
          // Mittagszeit hervorheben (GRÜN)
          if (data.cell.text[0].includes('11:40-12:50')) {
            data.cell.styles.fillColor = [212, 237, 218]; // Grün für Mittagszeit
            data.cell.styles.fontStyle = 'bold';
          }
          // Spätbetreuung hervorheben (LILA)
          if (data.cell.text[0].includes('14:40-15:30')) {
            data.cell.styles.fillColor = [220, 208, 255]; // Lila für Spätbetreuung
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });

      // ✅ PERSONAL-ÜBERSICHT hinzufügen
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 200;
      
      if (finalY < pageHeight - 60) { // Platz prüfen
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Personal-Übersicht:', 20, finalY);
        
        if (klasse.zugeordnetePersonen && klasse.zugeordnetePersonen.length > 0) {
          const personalTableData = [];
          
          klasse.zugeordnetePersonen.forEach(personId => {
            const person = getPersonById(personId);
            if (person) {
              const gesamtStunden = berechnePersonStundenInKlasse(person, klasse.klasse);
              const typInfo = getPersonalTypInfo(person.typ);
              
              personalTableData.push([
                person.name,
                person.typ,
                `${gesamtStunden.toFixed(1)} ${typInfo.isVollzeit ? 'h' : 'UStd'}/Woche`,
                person.email || 'Keine E-Mail'
              ]);
            }
          });

          if (personalTableData.length > 0) {
            autoTable(doc, {
              head: [['Name', 'Position', 'Stunden/Woche', 'E-Mail']],
              body: personalTableData,
              startY: finalY + 8,
              theme: 'striped',
              styles: {
                fontSize: 8,
                cellPadding: 2
              },
              headStyles: {
                fillColor: [46, 125, 50], // Grün
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9
              },
              columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 30, halign: 'center' },
                3: { cellWidth: 60 }
              }
            });
          }
        } else {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text('Noch kein Personal zugeordnet.', 25, finalY + 10);
        }
      }

      // ✅ FOOTER
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Erstellt mit Master-Plan System • Klassen-Verwaltung', 20, pageHeight - 15);
      doc.text(`Seite 1 von 1`, pageWidth - 40, pageHeight - 15);

      // ✅ DATEINAME generieren und speichern
      const fileName = `Stundenplan_Klasse_${klasse.klasse}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      console.log('💾 PDF wird gespeichert als:', fileName);
      doc.save(fileName);
      
      // ✅ SUCCESS-NACHRICHT
      const successEvent = new CustomEvent('showToast', {
        detail: { 
          message: `✅ Stundenplan für Klasse ${klasse.klasse} erfolgreich als PDF gespeichert!`, 
          type: 'success' 
        }
      });
      window.dispatchEvent(successEvent);
      
      console.log('✅ PDF Export erfolgreich abgeschlossen');
      return true;
      
    } catch (error) {
      console.error('❌ PDF-Export-Fehler:', error);
      
      // ✅ DETAILLIERTE FEHLERMELDUNG
      const errorEvent = new CustomEvent('showToast', {
        detail: { 
          message: `❌ PDF-Export fehlgeschlagen: ${error.message}`, 
          type: 'error' 
        }
      });
      window.dispatchEvent(errorEvent);
      
      // ✅ FALLBACK: Browser-Alert
      alert(`PDF-Export fehlgeschlagen!\n\nFehler: ${error.message}\n\nBitte prüfen Sie die Browser-Konsole für weitere Details.`);
      return false;
    }
  };

  const createBackup = () => {
    try {
      const backupData = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        app: 'Stundenplan-System',
        data: {
          masterStundenplaene,
          klassen: klassen,
          personal: getPersonalMitStatus(),
          chartConfig: CHART_CONFIG
        }
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `klassen_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('✅ Backup erfolgreich erstellt!');
    } catch (error) {
      console.error('❌ Backup-Fehler:', error);
      alert('Fehler beim Erstellen des Backups!');
    }
  };

  // ✅ VERBESSERTE VERTIKALES ZEIT-CHART mit intelligenter Blockstruktur
  const VertikalesZeitChart = ({ klasse }) => {
    const zeitslotDefinitionen = getZeitslotDefinition();
    
    const zeitMarker = [];
    for (let hour = CHART_CONFIG.startHour; hour <= CHART_CONFIG.endHour; hour++) {
      zeitMarker.push({
        hour,
        time: `${hour.toString().padStart(2, '0')}:00`,
        y: (hour - CHART_CONFIG.startHour) * CHART_CONFIG.pixelsPerHour
      });
    }

    const generatePersonBalken = (wochentag) => {
      const klassenplan = masterStundenplaene[klasse.klasse]?.[wochentag] || {};
      const balken = [];
      
      const allePersonenMitZeiten = [];
      Object.entries(klassenplan).forEach(([zeitslot, personEntries]) => {
        personEntries.forEach((personEntry) => {
          let personId, startZeit, endZeit, bemerkung;
          
          if (typeof personEntry === 'number') {
            personId = personEntry;
            const [start, end] = zeitslot.split('-');
            startZeit = start;
            endZeit = end;
            bemerkung = '';
          } else {
            personId = personEntry.personId;
            startZeit = personEntry.startZeit;
            endZeit = personEntry.endZeit;
            bemerkung = personEntry.bemerkung || '';
          }

          const person = getPersonById(personId);
          if (person && isValidTimeRange(startZeit, endZeit)) {
            // ✅ INTELLIGENTE FARB-ZUORDNUNG basierend auf Zeitslot
            let balkenFarbe = 'bg-blue-100 text-blue-800 border-blue-300'; // Standard: Unterricht
            
            const zeitslotDef = zeitslotDefinitionen.find(def => {
              const [defStart, defEnd] = def.zeit.split('-');
              return startZeit >= defStart && endZeit <= defEnd;
            });
            
            if (zeitslotDef) {
              switch (zeitslotDef.typ) {
                case 'pause':
                  balkenFarbe = 'bg-orange-100 text-orange-800 border-orange-300';
                  break;
                case 'mittagessen':
                  balkenFarbe = 'bg-green-100 text-green-800 border-green-300';
                  break;
                case 'betreuung':
                  balkenFarbe = 'bg-purple-100 text-purple-800 border-purple-300';
                  break;
                default:
                  balkenFarbe = 'bg-blue-100 text-blue-800 border-blue-300';
              }
            }
            
            allePersonenMitZeiten.push({
              personId,
              person,
              startZeit,
              endZeit,
              bemerkung,
              zeitslot,
              startMinutes: timeToMinutes(startZeit),
              endMinutes: timeToMinutes(endZeit),
              farbe: balkenFarbe
            });
          }
        });
      });

      const verarbeiteteIndexe = new Set();
      
      allePersonenMitZeiten.forEach((personZeit, index) => {
        if (verarbeiteteIndexe.has(index)) return;
        
        const gruppe = [personZeit];
        
        allePersonenMitZeiten.forEach((andere, otherIndex) => {
          if (index === otherIndex || verarbeiteteIndexe.has(otherIndex)) return;
          
          if (personZeit.startMinutes < andere.endMinutes && 
              personZeit.endMinutes > andere.startMinutes) {
            gruppe.push(andere);
            verarbeiteteIndexe.add(otherIndex);
          }
        });
        
        verarbeiteteIndexe.add(index);
        gruppe.sort((a, b) => a.startMinutes - b.startMinutes);
        
        gruppe.forEach((person, gruppenIndex) => {
          const startY = timeToPixels(person.startZeit);
          const endY = timeToPixels(person.endZeit);
          const height = endY - startY;

          const containerWidth = 150;
          const totalPersons = gruppe.length;
          const personWidth = containerWidth / totalPersons;
          const leftOffset = gruppenIndex * personWidth;

          balken.push({
            id: `${person.personId}-${person.startZeit}-${person.endZeit}-${index}`,
            person: person.person,
            startZeit: person.startZeit,
            endZeit: person.endZeit,
            bemerkung: person.bemerkung,
            startY,
            height,
            zeitslot: person.zeitslot,
            leftPx: leftOffset,
            widthPx: personWidth - 2,
            totalPersons: totalPersons,
            gruppenIndex: gruppenIndex,
            farbe: person.farbe
          });
        });
      });

      return balken;
    };

    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock size={20} />
            Vertikaler Stundenplan - Klasse {klasse.klasse}
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportKlasseAsPDF(klasse)}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
            >
              <Printer size={16} />
              PDF Export
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Drag & Drop → Flexible Zeiten
            </div>
          </div>
        </div>

        {/* ✅ LEGENDE für Zeittypen */}
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Zeittypen:</div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-xs">Unterricht</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-xs">Mittagessen</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
            <span className="text-xs">Pausen</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
            <span className="text-xs">Betreuung</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-max">
            <div className="relative">
              <div className="w-16 text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                Zeit
              </div>
              <div 
                className="relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                style={{ height: `${CHART_CONFIG.totalHeight}px`, width: '50px' }}
              >
                {zeitMarker.map(marker => (
                  <div
                    key={marker.hour}
                    className="absolute left-0 right-0 border-t border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400"
                    style={{ top: `${marker.y}px` }}
                  >
                    {marker.time}
                  </div>
                ))}
                
                {/* ✅ ZEITSLOT-MARKIERUNGEN im Zeit-Chart */}
                {zeitslotDefinitionen.map(slot => {
                  const [startTime, endTime] = slot.zeit.split('-');
                  const startY = timeToPixels(startTime);
                  const endY = timeToPixels(endTime);
                  const height = endY - startY;
                  
                  let bgColor = 'bg-blue-50';
                  if (slot.typ === 'pause') bgColor = 'bg-orange-50';
                  else if (slot.typ === 'mittagessen') bgColor = 'bg-green-50';
                  else if (slot.typ === 'betreuung') bgColor = 'bg-purple-50';
                  
                  return (
                    <div
                      key={slot.zeit}
                      className={`absolute left-0 right-0 ${bgColor} border-l-2 border-gray-400 opacity-30`}
                      style={{ top: `${startY}px`, height: `${height}px` }}
                      title={`${slot.name} (${slot.zeit})`}
                    />
                  );
                })}
              </div>
            </div>

            {wochentage.map((wochentag, tagIndex) => {
              const personBalken = generatePersonBalken(wochentag);
              
              return (
                <div key={wochentag} className="relative">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                    {wochentagsNamen[tagIndex]}
                  </div>
                  
                  <div 
                    className="relative bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer"
                    style={{ height: `${CHART_CONFIG.totalHeight}px`, width: '150px' }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, klasse.klasse, wochentag, e.clientY)}
                  >
                    {zeitMarker.map(marker => (
                      <div
                        key={marker.hour}
                        className="absolute left-0 right-0 border-t border-gray-100 dark:border-gray-700"
                        style={{ top: `${marker.y}px` }}
                      />
                    ))}

                    {personBalken.map((balken, balkenIndex) => (
                      <div
                        key={balken.id}
                        className={`absolute rounded border-2 cursor-pointer transition-all hover:shadow-lg group ${balken.farbe}`}
                        style={{ 
                          top: `${balken.startY}px`, 
                          height: `${balken.height}px`,
                          left: `${balken.leftPx}px`,
                          width: `${balken.widthPx}px`,
                          zIndex: 10 + balkenIndex
                        }}
                        onClick={() => {
                          removePersonFromMasterStundenplan(klasse.klasse, wochentag, balken.zeitslot, balken.person.id);
                        }}
                        title={`${balken.person.name} (${balken.person.typ})\n${balken.startZeit}-${balken.endZeit}${balken.bemerkung ? `\n${balken.bemerkung}` : ''}\nKlick zum Entfernen`}
                      >
                        <div className="p-1 h-full flex flex-col justify-center items-center text-center">
                          <div className="font-bold text-xs truncate w-full">
                            {getPersonLastName(balken.person.name)}
                          </div>
                          <div className="text-xs opacity-75 truncate w-full">
                            {balken.startZeit}-{balken.endZeit}
                          </div>
                          {balken.bemerkung && (
                            <div className="text-xs opacity-60 truncate w-full">
                              {balken.bemerkung}
                            </div>
                          )}
                          {balken.totalPersons > 1 && (
                            <div className="text-xs opacity-50 truncate w-full">
                              ({balken.gruppenIndex + 1}/{balken.totalPersons})
                            </div>
                          )}
                        </div>
                        
                        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600">
                            ×
                          </button>
                        </div>
                      </div>
                    ))}

                    {personBalken.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-xs text-gray-400 text-center">
                          <Plus size={16} className="mx-auto mb-1" />
                          Drag & Drop<br/>Person hier
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ✅ KOMPAKTE PERSONAL-ÜBERSICHT mit Auto-Update */}
        <div className="mt-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Users size={18} />
            📊 Personal-Übersicht für {klasse.klasse} (Live-Update)
          </h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                👥 {klasse.zugeordnetePersonen.length} Personen zugeteilt
              </span>
              <div className="mt-2 space-y-1">
                <div className="text-blue-600 dark:text-blue-400">
                  ⏰ Aus Master-Stundenplan generiert
                </div>
                <div className="text-emerald-600 dark:text-emerald-400">
                  📋 Mehrfach-Zuordnungen möglich
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Wochenstunden (Live):
              </div>
              {klasse.zugeordnetePersonen.slice(0, 5).map(personId => {
                const person = getPersonById(personId);
                if (!person) return null;
                
                const gesamtStunden = berechnePersonStundenInKlasse(person, klasse.klasse);
                const typInfo = getPersonalTypInfo(person.typ);
                
                return (
                  <div key={personId} className={`text-xs px-2 py-1 rounded ${typInfo.isVollzeit ? 'bg-emerald-200 text-emerald-900' : 'bg-blue-200 text-blue-900'}`}>
                    <strong>{person.name}:</strong> {gesamtStunden.toFixed(1)} {typInfo.isVollzeit ? 'h' : 'UStd'}
                  </div>
                );
              })}
              {klasse.zugeordnetePersonen.length > 5 && (
                <div className="text-xs text-gray-500">
                  +{klasse.zugeordnetePersonen.length - 5} weitere...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ PERSONAL-POOL KOMPONENTE (ohne Drag-Symbol)
  const PersonalZuordnungPanel = ({ klasse }) => {
    const zugeordnetePersonen = klasse.zugeordnetePersonen.map(id => getPersonById(id)).filter(Boolean);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users size={20} />
          Personal-Pool ({zugeordnetePersonen.length})
        </h4>
        
        <div className="space-y-3">
          {zugeordnetePersonen.map(person => {
            const colors = getPersonTypColor(person.typ, 'strong');
            
            return (
              <div
                key={person.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-move transition-all hover:shadow-lg ${colors} group`}
                draggable
                onDragStart={() => handleDragStart(person)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white opacity-90" />
                  <div>
                    <div className="font-medium text-white">
                      {person.name}
                    </div>
                    <div className="text-xs text-white opacity-90">
                      {person.typ} • Drag & Drop zum Zuordnen
                      {person.abwesend && <span className="ml-1">(Abwesend)</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePersonFromKlasse(klasse.id, person.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    title="Person aus Klasse entfernen"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
          
          <button
            onClick={() => {
              setCurrentKlasseForPersonSearch(klasse);
              setShowPersonSearchModal(true);
            }}
            className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
          >
            <Plus size={18} />
            Weitere Person hinzufügen
          </button>
        </div>
      </div>
    );
  };

  // ✅ ZEIT-MODAL für flexible Eingabe
  const TimeModal = () => {
    if (!showTimeModal || !timeModalData) return null;

    const [startZeit, setStartZeit] = useState(timeModalData.defaultStart || '08:00');
    const [endZeit, setEndZeit] = useState(timeModalData.defaultEnd || '09:00');
    const [bemerkung, setBemerkung] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (!timeModalData.person) {
        alert('❌ Keine Person ausgewählt!');
        return;
      }

      if (!isValidTimeRange(startZeit, endZeit)) {
        alert('❌ Ungültiger Zeitbereich! Zeit muss zwischen 8:00-16:00 liegen und Start < Ende sein.');
        return;
      }

      const konflikte = checkKonflikte(
        timeModalData.person.id, 
        timeModalData.klasseName, 
        timeModalData.wochentag, 
        startZeit, 
        endZeit
      );

      if (konflikte.length > 0) {
        const konfliktText = konflikte.map(k => k.details).join('\n');
        if (!window.confirm(`⚠️ KONFLIKTE ERKANNT:\n${konfliktText}\n\nTrotzdem zuordnen?`)) {
          return;
        }
      }

      addPersonToMasterStundenplanWithTime(
        timeModalData.klasseName,
        timeModalData.wochentag,
        startZeit,
        endZeit,
        timeModalData.person.id,
        bemerkung
      );

      setShowTimeModal(false);
      setTimeModalData(null);
    };

    const durationHours = ((timeToMinutes(endZeit) - timeToMinutes(startZeit)) / 60).toFixed(1);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              ⏰ Flexible Arbeitszeit festlegen
            </h3>
            <button 
              onClick={() => {
                setShowTimeModal(false);
                setTimeModalData(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <strong>👤 {timeModalData.person?.name}</strong> in <strong>🎓 {timeModalData.klasseName}</strong>
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              📅 {wochentagsNamen[wochentage.indexOf(timeModalData.wochentag)]}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🕐 Von (HH:MM)
                </label>
                <input
                  type="time"
                  value={startZeit}
                  onChange={(e) => setStartZeit(e.target.value)}
                  min="08:00"
                  max="15:59"
                  step="300"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🕑 Bis (HH:MM)
                </label>
                <input
                  type="time"
                  value={endZeit}
                  onChange={(e) => setEndZeit(e.target.value)}
                  min="08:05"
                  max="16:00"
                  step="300"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-lg"
                  required
                />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded p-3">
              <div className="text-sm text-green-800 dark:text-green-300">
                <strong>⏱️ Arbeitszeit:</strong> {durationHours} Stunden
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                Mehrere Personen zur gleichen Zeit werden horizontal angeordnet
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📝 Bemerkung (optional)
              </label>
              <input
                type="text"
                value={bemerkung}
                onChange={(e) => setBemerkung(e.target.value)}
                placeholder="z.B. Einzelförderung, Therapie, Projektarbeit..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowTimeModal(false);
                  setTimeModalData(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded hover:from-green-600 hover:to-blue-600 flex items-center justify-center gap-2 font-semibold"
              >
                <Save size={16} />
                ✅ Hinzufügen
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ✅ PERSON-SUCH-MODAL
  const PersonSearchModal = () => {
    if (!showPersonSearchModal || !currentKlasseForPersonSearch) return null;

    const verfuegbarePersonen = personalMitStatus.filter(p => 
      !currentKlasseForPersonSearch.zugeordnetePersonen.includes(p.id) && 
      p.aktiv &&
      (p.name.toLowerCase().includes(personSearchTerm.toLowerCase()) ||
       p.typ.toLowerCase().includes(personSearchTerm.toLowerCase()))
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Person zu Klasse {currentKlasseForPersonSearch.klasse} hinzufügen
            </h3>
            <button 
              onClick={() => {
                setShowPersonSearchModal(false);
                setCurrentKlasseForPersonSearch(null);
                setPersonSearchTerm('');
              }} 
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Person oder Typ suchen..."
                value={personSearchTerm}
                onChange={(e) => setPersonSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {verfuegbarePersonen.length} Personen gefunden
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {verfuegbarePersonen.map(person => {
              const colors = getPersonTypColor(person.typ, 'light');
              return (
                <div
                  key={person.id}
                  onClick={() => {
                    togglePersonZuordnung(currentKlasseForPersonSearch.id, person.id, false);
                    setShowPersonSearchModal(false);
                    setCurrentKlasseForPersonSearch(null);
                    setPersonSearchTerm('');
                  }}
                  className={`p-3 rounded border cursor-pointer hover:shadow-md transition-all ${colors}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${getPersonTypColor(person.typ, 'strong').split(' ')[0]}`} />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {person.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {person.standorte?.join(', ')}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs border ${colors}`}>
                      {person.typ}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {verfuegbarePersonen.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p>Keine Personen gefunden</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ✅ NEU: PROFESSIONELLES LÖSCH-BESTÄTIGUNGS-MODAL
  const DeleteConfirmationModal = () => {
    if (!showDeleteModal || !deleteModalData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {deleteModalData.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>
          </div>

          {/* Message */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 mb-6">
            <p className="text-red-800 dark:text-red-300 font-medium">
              {deleteModalData.message}
            </p>
            {deleteModalData.details && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                📍 {deleteModalData.details}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteModalData(null);
              }}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Abbrechen
            </button>
            <button
              onClick={deleteModalData.confirmAction}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg"
            >
              <Trash2 size={18} />
              Löschen
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ KLASSEN-EDIT MODAL
  const KlassenEditModal = () => {
    if (!showEditModal || !editingKlasse) return null;

    const [formData, setFormData] = useState({
      klasse: editingKlasse.klasse || '',
      schuelerzahl: editingKlasse.schuelerzahl || '',
      email: editingKlasse.email || '',
      telefon: editingKlasse.telefon || '',
      raum: editingKlasse.raum || '',
      klassenlehrkraft: editingKlasse.klassenlehrkraft || '',
      bemerkungen: editingKlasse.bemerkungen || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const updatedKlasse = { ...editingKlasse, ...formData };
      setKlassen(prev => prev.map(k => 
        k.id === editingKlasse.id ? updatedKlasse : k
      ));
      setShowEditModal(false);
      setEditingKlasse(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Klasse {formData.klasse} bearbeiten
            </h3>
            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Klassenbezeichnung
                </label>
                <input
                  type="text"
                  value={formData.klasse}
                  onChange={(e) => setFormData({ ...formData, klasse: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schülerzahl
                </label>
                <input
                  type="number"
                  value={formData.schuelerzahl}
                  onChange={(e) => setFormData({ ...formData, schuelerzahl: parseInt(e.target.value) || '' })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="1"
                  max="30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📧 E-Mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="klasse@schule.de"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📞 Telefon
                </label>
                <input
                  type="tel"
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0531-12345-123"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🏠 Raum
                </label>
                <input
                  type="text"
                  value={formData.raum}
                  onChange={(e) => setFormData({ ...formData, raum: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="R-103"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  👨‍🏫 Klassenlehrkraft
                </label>
                <input
                  type="text"
                  value={formData.klassenlehrkraft}
                  onChange={(e) => setFormData({ ...formData, klassenlehrkraft: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Max Mustermann"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📝 Bemerkungen
              </label>
              <textarea
                value={formData.bemerkungen}
                onChange={(e) => setFormData({ ...formData, bemerkungen: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows="3"
                placeholder="Besondere Hinweise zur Klasse..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Speichern
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ✅ NEUE KLASSE MODAL
  const NeueKlasseModal = () => {
    if (!showNewKlasseModal) return null;

    const [formData, setFormData] = useState({
      klasse: '',
      stufe: 'Primarstufe',
      standort: 'OBS',
      schuelerzahl: '',
      email: '',
      telefon: '',
      raum: '',
      klassenlehrkraft: '',
      bemerkungen: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      addNewKlasse(formData);
      setShowNewKlasseModal(false);
      setFormData({
        klasse: '',
        stufe: 'Primarstufe',
        standort: 'OBS',
        schuelerzahl: '',
        email: '',
        telefon: '',
        raum: '',
        klassenlehrkraft: '',
        bemerkungen: ''
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Neue Klasse erstellen
            </h3>
            <button onClick={() => setShowNewKlasseModal(false)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Klassenbezeichnung
                </label>
                <input
                  type="text"
                  value={formData.klasse}
                  onChange={(e) => setFormData({ ...formData, klasse: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="z.B. 1c, 5d, ..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schülerzahl
                </label>
                <input
                  type="number"
                  value={formData.schuelerzahl}
                  onChange={(e) => setFormData({ ...formData, schuelerzahl: parseInt(e.target.value) || '' })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="1"
                  max="30"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stufe
                </label>
                <select 
                  value={formData.stufe}
                  onChange={(e) => setFormData({ ...formData, stufe: e.target.value })}
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
                  value={formData.standort}
                  onChange={(e) => setFormData({ ...formData, standort: e.target.value })}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📧 E-Mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="klasse@schule.de"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📞 Telefon
                </label>
                <input
                  type="tel"
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0531-12345-123"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🏠 Raum
                </label>
                <input
                  type="text"
                  value={formData.raum}
                  onChange={(e) => setFormData({ ...formData, raum: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="R-103"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  👨‍🏫 Klassenlehrkraft
                </label>
                <input
                  type="text"
                  value={formData.klassenlehrkraft}
                  onChange={(e) => setFormData({ ...formData, klassenlehrkraft: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Max Mustermann"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📝 Bemerkungen
              </label>
              <textarea
                value={formData.bemerkungen}
                onChange={(e) => setFormData({ ...formData, bemerkungen: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows="3"
                placeholder="Besondere Hinweise zur Klasse..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowNewKlasseModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Erstellen
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const filteredKlassen = klassen.filter(klasse => {
    const nameMatch = klasse.klasse.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      klasse.standort.toLowerCase().includes(searchTerm.toLowerCase());
    const stufeMatch = filterStufe === 'alle' || klasse.stufe === filterStufe;
    const standortMatch = filterStandort === 'alle' || klasse.standort === filterStandort;
    
    return nameMatch && stufeMatch && standortMatch;
  });

  return (
    <div className="module-container">
      <div className="module-header">
        <h1 className="module-title">🎓 Klassen-Verwaltung</h1>
        <p className="module-subtitle">✅ VERBESSERT: Intelligente Pausen-Logik + PDF Export korrekt</p>
        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
          ✅ Mittagspause = Grün (M) • 3. Pause = Orange (P3) • PDF zeigt nur Unterricht + Mittagszeit • Vertikaler Plan mit Farb-Logik
        </p>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Klasse oder Standort suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <select
              value={filterStufe}
              onChange={(e) => setFilterStufe(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="alle">Alle Stufen</option>
              <option value="Primarstufe">Primarstufe</option>
              <option value="Sekundarstufe I">Sekundarstufe I</option>
              <option value="Sekundarstufe II">Sekundarstufe II</option>
            </select>

            <select
              value={filterStandort}
              onChange={(e) => setFilterStandort(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="alle">Alle Standorte</option>
              <option value="OBS">OBS</option>
              <option value="Bürgerstraße">Bürgerstraße</option>
              <option value="Johannes Selenka Schule">Johannes Selenka</option>
              <option value="Böcklinstraße">Böcklinstraße</option>
              <option value="Sidonienstraße">Sidonienstraße</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded">
              💾 Auto-Speicherung aktiv
            </div>
            
            <button 
              onClick={() => setShowNewKlasseModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={18} />
              Neue Klasse
            </button>
            
            <button
              onClick={createBackup}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <Download size={18} />
              Backup
            </button>
          </div>
        </div>

        {/* Klassen Liste */}
        <div className="space-y-6">
          {filteredKlassen.map(klasse => (
            <div
              key={klasse.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-600"
            >
              {/* Klassen Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                onClick={() => setExpandedKlasse(expandedKlasse === klasse.id ? null : klasse.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {klasse.klasse}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Klasse {klasse.klasse}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStufeColor(klasse.stufe)}`}>
                          {klasse.stufe}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {klasse.standort} • Raum {klasse.raum} • {klasse.schuelerzahl} Schüler
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          {klasse.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          {klasse.telefon}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {klasse.zugeordnetePersonen.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Personal
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportKlasseAsPDF(klasse);
                        }}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="PDF Export"
                      >
                        <Printer size={20} />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditKlasse(klasse);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Klasse bearbeiten"
                      >
                        <Edit size={20} />
                      </button>
                      
                      {expandedKlasse === klasse.id ? (
                        <ChevronUp size={24} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={24} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedKlasse === klasse.id && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="mt-6 space-y-6">
                    
                    {/* Personal-Zuordnung und Klassendaten */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-1">
                        <PersonalZuordnungPanel klasse={klasse} />
                      </div>
                      
                      <div className="lg:col-span-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                          <Home size={18} />
                          Klassendaten
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Klassenlehrkraft:</strong> {klasse.klassenlehrkraft}</div>
                          <div><strong>Schülerzahl:</strong> {klasse.schuelerzahl}</div>
                          {klasse.bemerkungen && (
                            <div><strong>Bemerkungen:</strong> {klasse.bemerkungen}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vertikales Zeit-Chart - Verbessert mit intelligenter Pausen-Logik */}
                    <VertikalesZeitChart klasse={klasse} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredKlassen.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Users size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium mb-2">Keine Klassen gefunden</h3>
            <p>Versuchen Sie einen anderen Suchbegriff oder fügen Sie eine neue Klasse hinzu.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewKlasseModal && <NeueKlasseModal />}
      {showEditModal && <KlassenEditModal />}
      {showPersonSearchModal && <PersonSearchModal />}
      {showTimeModal && <TimeModal />}
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  );
};

export default KlassenModule;