import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Search, Mail, FileText, AlertTriangle, Eye, UserX, Coffee, Sun, Moon, X, Check, Save, Download, Upload, CheckCircle, Send, Edit2, Trash2, Plus, User } from 'lucide-react';

// ✅ EMAIL INTEGRATION
import emailjs from '@emailjs/browser';

// ✅ PDF INTEGRATION  
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ✅ CONTEXT IMPORT statt dataStore Props
import { useStundenplan } from '../context/StundenplanContext';

// ✅ PROPS ENTFERNT - Context verwenden
const UebersichtModule = () => {
  const [selectedStufe, setSelectedStufe] = useState('alle');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchReplacement, setSearchReplacement] = useState('');
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [replacementContext, setReplacementContext] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ✅ VERTRETUNGSMANAGER STATES
  const [showVertretungsManager, setShowVertretungsManager] = useState(false);
  const [editingVertretung, setEditingVertretung] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // ✅ Debounced Search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchReplacement);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchReplacement]);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [generatedEmails, setGeneratedEmails] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  // ✅ CONTEXT ZUGRIFF statt dataStore Props
  const { 
    getPersonalMitStatus, 
    getPersonById,
    masterStundenplaene,
    masterPausenaufsichten,
    personalAbwesenheiten,
    klassenAbwesenheiten,
    ersatzTabelle, 
    setErsatzTabelle,
    // ✅ VERTRETUNGS-MANAGEMENT
    vertretungen,
    saveVertretung,
    removeVertretung,
    getVertretungenForDate
  } = useStundenplan();

  // ✅ STORAGE CONFIGURATION
  const STORAGE_KEYS = {
    VERTRETUNGEN: 'stundenplan_vertretungen_v2',
    SETTINGS: 'stundenplan_settings_v1'
  };

  // ✅ VERBESSERTE STORAGE FUNKTIONEN
  const saveToStorage = (key, data) => {
    try {
      const dataWithMeta = {
        data,
        timestamp: new Date().toISOString(),
        version: '2.0'
      };
      localStorage.setItem(key, JSON.stringify(dataWithMeta));
      console.log(`✅ Gespeichert: ${key}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Storage Save Error (${key}):`, error);
      showToastMessage(`Speicherfehler: ${error.message}`);
      return { success: false, error };
    }
  };

  const loadFromStorage = (key) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log(`✅ Geladen: ${key}`);
        return { success: true, data: parsed.data || parsed };
      }
      return { success: false, error: 'No data found' };
    } catch (error) {
      console.error(`❌ Storage Load Error (${key}):`, error);
      return { success: false, error };
    }
  };

  // ✅ Dark Mode
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // ✅ EmailJS Config
  const EMAILJS_CONFIG = {
    serviceId: 'service_stundenplan',
    templateId: 'template_vertretung',
    publicKey: 'your_public_key'
  };

  const istFreitag = selectedDate.getDay() === 5;

  const schulzeiten = [
    { von: '08:00', bis: '08:45', name: '1. Block (1/2)', block: 1 },
    { von: '08:45', bis: '09:30', name: '1. Block (2/2)', block: 1 },
    { von: '09:30', bis: '09:50', name: '1. Pause', typ: 'pause' },
    { von: '09:50', bis: '10:35', name: '2. Block (1/2)', block: 2 },
    { von: '10:35', bis: '11:20', name: '2. Block (2/2)', block: 2 },
    { von: '11:20', bis: '11:40', name: '2. Pause', typ: 'pause' },
    { von: '11:40', bis: '12:50', name: 'Mittagessen', block: 'mittagessen' },
    ...(istFreitag ? [] : [
      { von: '12:50', bis: '13:10', name: '3. Pause', typ: 'pause' },
      { von: '13:10', bis: '14:40', name: '3. Block', block: 3 }
    ])
  ];

  const klassen = {
    primarstufe: [
      { name: '1a', standort: 'OBS' },
      { name: '1b', standort: 'OBS' },
      { name: '1c', standort: 'OBS' },
      { name: '1d', standort: 'Volkmarode' },
      { name: '2a', standort: 'OBS' },
      { name: '2b', standort: 'OBS' },
      { name: '2d', standort: 'Volkmarode' },
      { name: '3a', standort: 'OBS' },
      { name: '3b', standort: 'OBS' },
      { name: '3d', standort: 'Bürgerstraße' },
      { name: '4a', standort: 'OBS' },
      { name: '4b', standort: 'OBS' },
      { name: '4d', standort: 'Bürgerstraße' }
    ],
    sek1: [
      { name: '5a', standort: 'OBS' },
      { name: '5b', standort: 'OBS' },
      { name: '5e', standort: 'Sidonienstraße' },
      { name: '6a', standort: 'Böcklinstraße' },
      { name: '6b', standort: 'Böcklinstraße' },
      { name: '6d', standort: 'Böcklinstraße' },
      { name: '6f', standort: 'HvF' },
      { name: '7a', standort: 'Sidonienstraße' },
      { name: '7b', standort: 'Böcklinstraße' },
      { name: '7c', standort: 'OBS' },
      { name: '8a', standort: 'OBS' },
      { name: '8b', standort: 'OBS' },
      { name: '9a', standort: 'OBS' },
      { name: '9b', standort: 'OBS' },
      { name: '9c', standort: 'OBS' },
      { name: '9d', standort: 'OBS' }
    ],
    sek2: [
      { name: '10a', standort: 'OBS' },
      { name: '10b', standort: 'OBS' },
      { name: '10c', standort: 'OBS' },
      { name: '11a', standort: 'OBS' },
      { name: '11b', standort: 'OBS' },
      { name: '12b', standort: 'OBS' },
      { name: 'Koop JSS', standort: 'Johannes Selenka' }
    ]
  };
  
  // ✅ ABWESENHEITS-PRÜFUNGEN
  const isPersonAbwesendById = (personId, datum = selectedDate) => {
    const person = getPersonById(personId);
    if (!person) return false;
    
    const dateString = datum.toISOString().split('T')[0];
    return personalAbwesenheiten.some(abw => {
      const vonDate = abw.von;
      const bisDate = abw.bis || abw.von;
      return abw.person === person.name && 
             dateString >= vonDate && 
             dateString <= bisDate;
    });
  };

  const getPersonAbwesenheitsgrundById = (personId, datum = selectedDate) => {
    const person = getPersonById(personId);
    if (!person) return null;
    
    const dateString = datum.toISOString().split('T')[0];
    const abwesenheit = personalAbwesenheiten.find(abw => {
      const vonDate = abw.von;
      const bisDate = abw.bis || abw.von;
      return abw.person === person.name && 
             dateString >= vonDate && 
             dateString <= bisDate;
    });
    return abwesenheit?.grund || null;
  };

  const isKlasseAbwesend = (klasseName, datum = selectedDate) => {
    const dateString = datum.toISOString().split('T')[0];
    return klassenAbwesenheiten.some(abw => {
      const vonDate = abw.von;
      const bisDate = abw.bis || abw.von;
      return abw.klasse === klasseName && 
             dateString >= vonDate && 
             dateString <= bisDate;
    });
  };

  const getKlassenAbwesenheitsgrund = (klasseName, datum = selectedDate) => {
    const dateString = datum.toISOString().split('T')[0];
    const abwesenheit = klassenAbwesenheiten.find(abw => {
      const vonDate = abw.von;
      const bisDate = abw.bis || abw.von;
      return abw.klasse === klasseName && 
             dateString >= vonDate && 
             dateString <= bisDate;
    });
    return abwesenheit?.grund || null;
  };

  const getCurrentDayName = () => {
    const wochentagNames = ['sonntag', 'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag'];
    return wochentagNames[selectedDate.getDay()];
  };

  // ✅ OPTIMIERTE STUNDENPLAN-GENERIERUNG mit persistenten Vertretungen
  const generateCurrentDaySchedule = () => {
    const currentDay = getCurrentDayName();
    const tagesVertretungen = getVertretungenForDate(selectedDate);
    const schedule = {};

    Object.entries(masterStundenplaene || {}).forEach(([klasse, wochenplan]) => {
      const tagesplan = wochenplan[currentDay] || {};
      schedule[klasse] = {};

      Object.entries(tagesplan).forEach(([zeitslot, personIds]) => {
        schedule[klasse][zeitslot] = personIds.map(personId => {
          const person = getPersonById(personId);
          const isAbwesend = isPersonAbwesendById(personId);
          const abwesenheitsgrund = getPersonAbwesenheitsgrundById(personId);
          
          // Vertretungs-Suche
          const vertretungKey = Object.keys(tagesVertretungen).find(key => {
            try {
              const parsedKey = JSON.parse(key);
              return parsedKey.type === 'stundenplan' && 
                     parsedKey.klasse === klasse && 
                     parsedKey.zeit === zeitslot && 
                     parsedKey.person?.id === personId;
            } catch (e) {
              return false;
            }
          });
          
          const vertretung = vertretungKey ? tagesVertretungen[vertretungKey] : null;
          
          if (vertretung && isAbwesend) {
            const ersatzPerson = getPersonById(vertretung.ersatzPersonId);
            if (ersatzPerson) {
              return {
                person: {
                  ...ersatzPerson,
                  abwesend: false,
                  originalPerson: person?.name || 'Unbekannt',
                },
                isReplacement: true,
                originalPerson: person,
                vertretungKey
              };
            }
          }
          
          return {
            person: {
              ...person,
              abwesend: isAbwesend,
              abwesenheitsgrund: abwesenheitsgrund
            } || { name: 'Unbekannt', id: personId, abwesend: false },
            isReplacement: false
          };
        });
      });
    });

    return schedule;
  };

  // ✅ OPTIMIERTE PAUSENAUFSICHTEN-GENERIERUNG
  const generateCurrentDayPausenaufsichten = () => {
    const currentDay = getCurrentDayName();
    const tagesVertretungen = getVertretungenForDate(selectedDate);
    const tagesaufsichten = masterPausenaufsichten?.[currentDay] || {};
    const result = {};

    const findVertretung = (type, personId, bereich = null, pause = null) => {
      const vertretungKey = Object.keys(tagesVertretungen).find(key => {
        try {
          const parsedKey = JSON.parse(key);
          return parsedKey.type === type && 
                 parsedKey.person?.id === personId &&
                 (bereich ? parsedKey.bereich === bereich : true) &&
                 (pause ? parsedKey.pause === pause : true);
        } catch (e) {
          return false;
        }
      });
      return vertretungKey ? { ...tagesVertretungen[vertretungKey], vertretungKey } : null;
    };

    // Frühaufsicht
    if (tagesaufsichten.fruehaufsicht) {
      result.fruehaufsicht = Object.entries(tagesaufsichten.fruehaufsicht).map(([bereich, personId]) => {
        const person = getPersonById(personId);
        const isAbwesend = isPersonAbwesendById(personId);
        const vertretung = findVertretung('fruehaufsicht', personId, bereich);
        
        if (vertretung && isAbwesend) {
          const ersatzPerson = getPersonById(vertretung.ersatzPersonId);
          if (ersatzPerson) {
            return {
              bereich,
              person: {
                ...ersatzPerson,
                abwesend: false,
                originalPerson: person?.name || 'Unbekannt',
              },
              isReplacement: true,
              originalPerson: person,
              vertretungKey: vertretung.vertretungKey
            };
          }
        }
        
        return {
          bereich,
          person: {
            ...person,
            abwesend: isAbwesend,
            abwesenheitsgrund: getPersonAbwesenheitsgrundById(personId)
          } || { name: 'Unbekannt', id: personId, abwesend: false },
          isReplacement: false
        };
      });
    }

    // Spätaufsicht
    if (tagesaufsichten.spaetaufsicht) {
      result.spaetaufsicht = Object.entries(tagesaufsichten.spaetaufsicht).map(([bereich, personId]) => {
        const person = getPersonById(personId);
        const isAbwesend = isPersonAbwesendById(personId);
        const vertretung = findVertretung('spaetaufsicht', personId, bereich);
        
        if (vertretung && isAbwesend) {
          const ersatzPerson = getPersonById(vertretung.ersatzPersonId);
          if (ersatzPerson) {
            return {
              bereich,
              person: {
                ...ersatzPerson,
                abwesend: false,
                originalPerson: person?.name || 'Unbekannt',
              },
              isReplacement: true,
              originalPerson: person,
              vertretungKey: vertretung.vertretungKey
            };
          }
        }
        
        return {
          bereich,
          person: {
            ...person,
            abwesend: isAbwesend,
            abwesenheitsgrund: getPersonAbwesenheitsgrundById(personId)
          } || { name: 'Unbekannt', id: personId, abwesend: false },
          isReplacement: false
        };
      });
    }

    // Pausenaufsichten 1, 2, 3
    ['pause1', 'pause2', 'pause3'].forEach((pauseKey, index) => {
      if (!tagesaufsichten[pauseKey]) return;
      
      result[pauseKey] = {
        hauptaufsichten: {},
        einzelaufsichten: []
      };

      // Hauptaufsichten
      if (tagesaufsichten[pauseKey].hauptaufsichten) {
        Object.entries(tagesaufsichten[pauseKey].hauptaufsichten).forEach(([bereichsgruppe, bereiche]) => {
          result[pauseKey].hauptaufsichten[bereichsgruppe] = Object.entries(bereiche).map(([bereich, personId]) => {
            const person = getPersonById(personId);
            const isAbwesend = isPersonAbwesendById(personId);
            const vertretung = findVertretung('hauptaufsicht', personId, bereich, index + 1);
            
            if (vertretung && isAbwesend) {
              const ersatzPerson = getPersonById(vertretung.ersatzPersonId);
              if (ersatzPerson) {
                return {
                  bereich,
                  person: {
                    ...ersatzPerson,
                    abwesend: false,
                    originalPerson: person?.name || 'Unbekannt',
                  },
                  isReplacement: true,
                  originalPerson: person,
                  vertretungKey: vertretung.vertretungKey
                };
              }
            }
            
            return {
              bereich,
              person: {
                ...person,
                abwesend: isAbwesend,
                abwesenheitsgrund: getPersonAbwesenheitsgrundById(personId)
              } || { name: 'Unbekannt', id: personId, abwesend: false },
              isReplacement: false
            };
          });
        });
      }

      // Einzelaufsichten
      if (tagesaufsichten[pauseKey].einzelaufsichten) {
        result[pauseKey].einzelaufsichten = tagesaufsichten[pauseKey].einzelaufsichten.map(einzelaufsicht => {
          const person = getPersonById(einzelaufsicht.personId);
          const isAbwesend = isPersonAbwesendById(einzelaufsicht.personId);
          const vertretung = findVertretung('einzelaufsicht', einzelaufsicht.personId, einzelaufsicht.schueler, index + 1);
          
          if (vertretung && isAbwesend) {
            const ersatzPerson = getPersonById(vertretung.ersatzPersonId);
            if (ersatzPerson) {
              return {
                schueler: einzelaufsicht.schueler,
                person: {
                  ...ersatzPerson,
                  abwesend: false,
                  originalPerson: person?.name || 'Unbekannt',
                },
                isReplacement: true,
                originalPerson: person,
                vertretungKey: vertretung.vertretungKey
              };
            }
          }
          
          return {
            schueler: einzelaufsicht.schueler,
            person: {
              ...person,
              abwesend: isAbwesend,
              abwesenheitsgrund: getPersonAbwesenheitsgrundById(einzelaufsicht.personId)
            } || { name: 'Unbekannt', id: einzelaufsicht.personId, abwesend: false },
            isReplacement: false
          };
        });
      }
    });

    return result;
  };

  // ✅ MEMOIZED DATA mit Vertretungen-Abhängigkeit
  const stundenplaene = React.useMemo(() => generateCurrentDaySchedule(), [
    personalAbwesenheiten, 
    selectedDate, 
    masterStundenplaene, 
    vertretungen
  ]);

  const pausenaufsichten = React.useMemo(() => generateCurrentDayPausenaufsichten(), [
    personalAbwesenheiten, 
    selectedDate, 
    masterPausenaufsichten, 
    vertretungen
  ]);

  // ✅ Toast Auto-Hide
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // ✅ Ersatztabelle initialisieren
  useEffect(() => {
    if (!ersatzTabelle || Object.keys(ersatzTabelle).length === 0) {
      setErsatzTabelle({
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
        },
        'Mittwoch': {
          pause1: ['Jana Fischer', 'Michael Klein', 'Sarah Weber'],
          pause2: ['Anna Schmidt', 'Thomas Mueller', 'Sabine Müller'],
          pause3: ['Frank Richter', 'Andreas Wolf', 'Markus Bauer'],
          fruehaufsicht: ['Claudia Neumann', 'Lisa Wagner'],
          spaetaufsicht: ['Peter Hoffmann', 'Jana Fischer']
        },
        'Donnerstag': {
          pause1: ['Peter Hoffmann', 'Lisa Wagner', 'Claudia Neumann'],
          pause2: ['Michael Klein', 'Jana Fischer', 'Sarah Weber'],
          pause3: ['Thomas Mueller', 'Anna Schmidt', 'Sabine Müller'],
          fruehaufsicht: ['Frank Richter', 'Markus Bauer'],
          spaetaufsicht: ['Andreas Wolf', 'Claudia Neumann']
        },
        'Freitag': {
          pause1: ['Frank Richter', 'Markus Bauer', 'Andreas Wolf'],
          pause2: ['Claudia Neumann', 'Sarah Weber', 'Jana Fischer'],
          pause3: null,
          fruehaufsicht: ['Lisa Wagner', 'Michael Klein'],
          spaetaufsicht: ['Anna Schmidt', 'Thomas Mueller']
        }
      });
    }
  }, [ersatzTabelle, setErsatzTabelle]);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };
  
  // ✅ PDF VERTRETUNGSZETTEL GENERIEREN
  const generateVertretungszettel = () => {
    const alleVertretungen = strukturierteVertretungen;
    if (alleVertretungen.length === 0) {
      alert('Keine Vertretungen für diesen Tag vorhanden.');
      return;
    }

    try {
      const doc = new jsPDF();
      const datum = selectedDate.toLocaleDateString('de-DE', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      // Header
      doc.setFontSize(20);
      doc.text('📋 Vertretungsplan', 20, 30);
      doc.setFontSize(14);
      doc.text(datum, 20, 45);
      doc.setFontSize(12);
      doc.text(`Erstellt am: ${new Date().toLocaleString('de-DE')}`, 20, 55);

      let yPos = 75;

      // Unterrichtsvertretungen
      const unterrichtsVertretungen = alleVertretungen.filter(v => v.context.type === 'stundenplan');
      if (unterrichtsVertretungen.length > 0) {
        doc.setFontSize(14);
        doc.text('🎓 Unterrichtsvertretungen:', 20, yPos);
        yPos += 15;
        
        doc.setFontSize(10);
        unterrichtsVertretungen.forEach(v => {
          const text = `${v.zeit} | ${v.beschreibung} | ${v.originalPerson?.name} → ${v.ersatzPerson?.name}`;
          doc.text(text, 25, yPos);
          yPos += 10;
        });
        yPos += 10;
      }

      // Pausenaufsichtsvertretungen
      const pausenVertretungen = alleVertretungen.filter(v => ['fruehaufsicht', 'spaetaufsicht', 'hauptaufsicht', 'einzelaufsicht'].includes(v.context.type));
      if (pausenVertretungen.length > 0) {
        doc.setFontSize(14);
        doc.text('👁️ Pausenaufsichtsvertretungen:', 20, yPos);
        yPos += 15;
        
        doc.setFontSize(10);
        pausenVertretungen.forEach(v => {
          const text = `${v.zeit} | ${v.beschreibung} | ${v.originalPerson?.name} → ${v.ersatzPerson?.name}`;
          doc.text(text, 25, yPos);
          yPos += 10;
        });
      }

      // Footer
      doc.setFontSize(8);
      doc.text('Automatisch generiert vom Master-Plan System', 20, 280);

      doc.save(`Vertretungsplan_${selectedDate.toISOString().split('T')[0]}.pdf`);
      showToastMessage('✅ Vertretungszettel erfolgreich erstellt!');
    } catch (error) {
      console.error('PDF-Fehler:', error);
      showToastMessage('❌ Fehler beim Erstellen des PDFs');
    }
  };

  // ✅ EMAIL AN VERTRETUNGSPERSONEN SENDEN
  const sendVertretungsEmails = async () => {
    const alleVertretungen = strukturierteVertretungen;
    if (alleVertretungen.length === 0) {
      alert('Keine Vertretungen für diesen Tag vorhanden.');
      return;
    }

    const ersatzPersonen = [...new Set(alleVertretungen.map(v => v.ersatzPerson?.name).filter(Boolean))];
    const emailData = [];
    
    ersatzPersonen.forEach(personName => {
      const person = getPersonalMitStatus().find(p => p.name === personName);
      if (person && person.email) {
        const personVertretungen = alleVertretungen.filter(v => v.ersatzPerson?.name === personName);
        emailData.push({
          name: personName,
          email: person.email,
          vertretungen: personVertretungen
        });
      }
    });

    if (emailData.length === 0) {
      alert('Keine E-Mail-Adressen für die Vertretungspersonen gefunden.');
      return;
    }

    const datum = selectedDate.toLocaleDateString('de-DE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    try {
      let emailText = `Liebe Kolleginnen und Kollegen,\n\n`;
      emailText += `Sie sind für ${datum} als Vertretung eingeteilt:\n\n`;
      
      emailData.forEach(personData => {
        emailText += `👤 ${personData.name}:\n`;
        
        personData.vertretungen.forEach(v => {
          if (v.context.type === 'stundenplan') {
            emailText += `  📚 ${v.zeit} - ${v.beschreibung} (für ${v.originalPerson?.name})\n`;
          } else {
            emailText += `  👁️ ${v.zeit} - ${v.beschreibung} (für ${v.originalPerson?.name})\n`;
          }
        });
        emailText += `\n`;
      });
      
      emailText += `Bei Fragen wenden Sie sich bitte an die Schulleitung.\n\n`;
      emailText += `Mit freundlichen Grüßen\nIhr Master-Plan System`;

      const emailAdressen = emailData.map(p => p.email);
      
      console.log('📧 E-Mail würde gesendet an:', emailAdressen);
      console.log('📧 E-Mail-Inhalt:', emailText);
      
      alert(`✅ Vertretungs-E-Mails würden gesendet werden an:\n${emailAdressen.join(', ')}\n\n(E-Mail-Inhalt siehe Konsole)`);
      showToastMessage(`✅ ${emailData.length} E-Mails würden versendet`);
    } catch (error) {
      console.error('E-Mail-Fehler:', error);
      showToastMessage('❌ Fehler beim E-Mail-Versand');
    }
  };

  // ✅ BACKUP FUNKTION (erweitert mit Vertretungen)
  const createBackup = () => {
    try {
      const backupData = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        app: 'Stundenplan-System',
        data: {
          masterStundenplaene,
          masterPausenaufsichten,
          selectedDate: selectedDate.toISOString(),
          personal: getPersonalMitStatus(),
          klassen: klassen,
          ersatzTabelle: ersatzTabelle,
          vertretungen: vertretungen
        }
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stundenplan_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToastMessage('✅ Backup erfolgreich erstellt (inkl. Vertretungen)!');
    } catch (error) {
      console.error('❌ Backup-Fehler:', error);
      showToastMessage('Fehler beim Erstellen des Backups!');
    }
  };

  // ✅ ERSATZPERSONAL HOLEN
  const getErsatzPersonalFuerTag = (wochentag, pauseTyp) => {
    const wochentagNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const wochentagKey = wochentagNames[wochentag];
    const verfuegbareNamen = ersatzTabelle?.[wochentagKey]?.[pauseTyp] || [];

    return getPersonalMitStatus().filter(p => 
      verfuegbareNamen.includes(p.name) && 
      !p.abwesend && 
      p.aktiv
    );
  };

  const getPersonColor = (person, isReplacement = false) => {
    if (person.abwesend) return 'bg-red-100 border-red-300 text-red-800';
    if (isReplacement) return 'bg-green-100 border-green-300 text-green-800';
    return 'bg-blue-100 border-blue-300 text-blue-800';
  };

  const openReplacementModal = (context) => {
    const contextWithDay = {
      ...context,
      wochentag: selectedDate.getDay()
    };
    
    setReplacementContext(contextWithDay);
    setShowReplacementModal(true);
    setSearchReplacement('');
  };

  // ✅ VERBESSERTE VERTRETUNGS-LOGIK mit persistenter Speicherung
  const selectReplacement = (replacementPerson) => {
    if (!replacementContext) return;
    
    const dateKey = selectedDate.toISOString().split('T')[0];
    
    const contextKey = JSON.stringify({
      type: replacementContext.type,
      klasse: replacementContext.klasse,
      zeit: replacementContext.zeit,
      bereich: replacementContext.bereich,
      pause: replacementContext.pause,
      schueler: replacementContext.schueler,
      person: { id: replacementContext.person?.id }
    });
    
    const vertretungData = {
      originalPersonId: replacementContext.person?.id,
      ersatzPersonId: replacementPerson.id,
      ersatzPersonName: replacementPerson.name,
      context: replacementContext,
      timestamp: new Date().toISOString()
    };
    
    saveVertretung(dateKey, contextKey, vertretungData);
    showToastMessage(`✅ ${replacementPerson.name} übernimmt heute die Vertretung für ${replacementContext.person?.name}!`);
    
    setShowReplacementModal(false);
    setReplacementContext(null);
  };

  // ✅ VERTRETUNGSMANAGER FUNKTIONEN
  const dateKey = selectedDate.toISOString().split('T')[0];
  const tagesVertretungen = getVertretungenForDate(selectedDate);
  
  const strukturierteVertretungen = Object.entries(tagesVertretungen).map(([contextKey, vertretung]) => {
    try {
      const context = JSON.parse(contextKey);
      const originalPerson = getPersonById(vertretung.originalPersonId);
      const ersatzPerson = getPersonById(vertretung.ersatzPersonId);
      
      return {
        id: contextKey,
        context,
        vertretung,
        originalPerson,
        ersatzPerson,
        beschreibung: generateBeschreibung(context),
        zeit: getZeitFromContext(context)
      };
    } catch (e) {
      return null;
    }
  }).filter(Boolean);

  const generateBeschreibung = (context) => {
    switch (context.type) {
      case 'stundenplan':
        return `${context.klasse} • ${context.zeit}`;
      case 'fruehaufsicht':
        return `Frühaufsicht • ${context.bereich}`;
      case 'spaetaufsicht':
        return `Spätaufsicht • ${context.bereich}`;
      case 'hauptaufsicht':
        return `${context.pause}. Pause • ${context.bereich}`;
      case 'einzelaufsicht':
        return `${context.pause}. Pause • ${context.schueler}`;
      default:
        return 'Unbekannte Vertretung';
    }
  };

  const getZeitFromContext = (context) => {
    if (context.zeit) return context.zeit;
    if (context.type === 'fruehaufsicht') return '07:45-08:00';
    if (context.type === 'spaetaufsicht') return '14:40-15:30';
    if (context.type === 'hauptaufsicht' || context.type === 'einzelaufsicht') {
      const pauseZeiten = ['09:30-09:50', '11:20-11:40', '12:50-13:10'];
      return pauseZeiten[context.pause - 1] || 'Unbekannt';
    }
    return 'Unbekannt';
  };

  const handleEditVertretung = (vertretungsItem) => {
    setEditingVertretung(vertretungsItem);
    setShowEditModal(true);
  };

  const handleDeleteVertretung = (vertretungsItem) => {
    if (window.confirm(`Vertretung von ${vertretungsItem.ersatzPerson?.name} für ${vertretungsItem.originalPerson?.name} wirklich löschen?`)) {
      removeVertretung(dateKey, vertretungsItem.id);
    }
  };

  const handleSaveEditVertretung = (newErsatzPersonId) => {
    if (!editingVertretung) return;
    
    const newErsatzPerson = getPersonById(newErsatzPersonId);
    if (!newErsatzPerson) return;

    const updatedVertretung = {
      ...editingVertretung.vertretung,
      ersatzPersonId: newErsatzPersonId,
      ersatzPersonName: newErsatzPerson.name,
      lastModified: new Date().toISOString()
    };

    saveVertretung(dateKey, editingVertretung.id, updatedVertretung);
    setShowEditModal(false);
    setEditingVertretung(null);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ✅ STUNDENPLAN-TABELLE KOMPONENTE
  const StundenplanTabelle = ({ klassen: klassenListe, stufeName }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar size={24} />
          {stufeName}
        </h3>
      </div>
      
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full min-w-max">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-3 py-3 text-left font-semibold text-gray-900 dark:text-white sticky left-0 bg-gray-50 dark:bg-gray-700 z-10 min-w-[140px]">
                Zeit
              </th>
              {klassenListe.map(klasse => (
                <th key={klasse.name} className="px-2 py-3 text-center font-semibold text-gray-900 dark:text-white min-w-[100px] max-w-[120px]">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-sm">{klasse.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                      <MapPin size={8} />
                      <span className="truncate" title={klasse.standort}>{klasse.standort}</span>
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schulzeiten.map(zeit => (
              <tr key={zeit.von} className={`border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750 ${zeit.typ ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
                <td className="px-3 py-3 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-600 min-w-[140px]">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{zeit.von}-{zeit.bis}</span>
                    <span className={`text-xs ${zeit.typ === 'pause' ? 'text-orange-500 font-semibold' : 
                                                zeit.block === 'mittagessen' ? 'text-green-500 font-semibold' : 
                                                'text-gray-500'}`}>
                      {zeit.name}
                    </span>
                  </div>
                </td>
                {zeit.typ ? (
                  klassenListe.map(klasse => (
                    <td key={klasse.name} className={`px-4 py-3 text-center font-medium ${
                      zeit.typ === 'pause' ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' :
                      'text-gray-600'
                    }`}>
                      {isKlasseAbwesend(klasse.name) ? (
                        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-2 py-1 rounded text-xs font-medium inline-block">
                          <div className="flex items-center gap-1">
                            <AlertTriangle size={8} />
                            <span>Klasse weg</span>
                          </div>
                          <div className="text-xs opacity-75">
                            {getKlassenAbwesenheitsgrund(klasse.name)}
                          </div>
                        </div>
                      ) : (
                        zeit.name
                      )}
                    </td>
                  ))
                ) : (
                  klassenListe.map(klasse => {
                    const zeitSlot = `${zeit.von}-${zeit.bis}`;
                    const assignments = stundenplaene[klasse.name]?.[zeitSlot] || [];
                    
                    return (
                      <td key={klasse.name} className="px-1 py-2 text-center min-w-[100px] max-w-[120px]">
                        {assignments.length === 0 ? (
                          <div className="text-gray-400 text-xs h-12 flex items-center justify-center">
                            {isKlasseAbwesend(klasse.name) ? (
                              <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                <div className="flex items-center gap-1">
                                  <AlertTriangle size={8} />
                                  <span>Klasse abwesend</span>
                                </div>
                                <div className="text-xs opacity-75">
                                  {getKlassenAbwesenheitsgrund(klasse.name)}
                                </div>
                              </div>
                            ) : (
                              '-'
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {isKlasseAbwesend(klasse.name) ? (
                              <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                <div className="flex items-center gap-1 mb-1">
                                  <AlertTriangle size={8} />
                                  <span>Klasse abwesend</span>
                                </div>
                                <div className="text-xs opacity-75 mb-2">
                                  {getKlassenAbwesenheitsgrund(klasse.name)}
                                </div>
                                {assignments.map((assignment, idx) => (
                                  <div
                                    key={idx}
                                    className="px-2 py-1 rounded text-xs font-medium border bg-gray-100 border-gray-300 text-gray-500 opacity-50"
                                  >
                                    <span className="truncate" title={assignment.person.name}>{assignment.person.name}</span>
                                    <div className="text-xs opacity-75">
                                      (Klasse nicht da)
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              assignments.map((assignment, idx) => (
                                <div
                                  key={idx}
                                  className={`px-2 py-1 rounded text-xs font-medium border cursor-pointer transition-all hover:shadow-md ${getPersonColor(assignment.person, assignment.isReplacement)}`}
                                  onClick={() => {
                                    console.log('🔍 Geklickt auf:', assignment.person.name);
                                    console.log('🔍 Abwesend?', assignment.person.abwesend);
                                    console.log('🔍 Grund:', assignment.person.abwesenheitsgrund);
                                    
                                    if (assignment.person.abwesend) {
                                      openReplacementModal({
                                        type: 'stundenplan',
                                        klasse: klasse.name,
                                        zeit: zeitSlot,
                                        person: assignment.person
                                      });
                                    } else {
                                      console.log('❌ Person ist nicht als abwesend markiert!');
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-center gap-1">
                                    {assignment.person.abwesend && <AlertTriangle size={8} />}
                                    {assignment.isReplacement && <Check size={8} />}
                                    <span className="truncate" title={assignment.person.name}>{assignment.person.name}</span>
                                  </div>
                                  {assignment.person.abwesend && (
                                    <div className="text-xs opacity-75 truncate">
                                      {assignment.person.abwesenheitsgrund}
                                    </div>
                                  )}
                                  {assignment.isReplacement && (
                                    <div className="text-xs opacity-75 truncate">
                                      ↳ für {assignment.person.originalPerson}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ✅ PAUSENAUFSICHTEN BEREICH
  const PausenaufsichtenBereich = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Eye size={24} />
          Pausenaufsichten (aus Master-Plänen)
        </h3>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Frühaufsicht */}
        {pausenaufsichten.fruehaufsicht && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sun size={20} />
              Frühaufsicht (7:45-8:00 Uhr)
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {pausenaufsichten.fruehaufsicht.map((aufsicht, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-all hover:shadow-md ${getPersonColor(aufsicht.person, aufsicht.isReplacement)}`}
                  onClick={() => aufsicht.person.abwesend && openReplacementModal({
                    type: 'fruehaufsicht',
                    bereich: aufsicht.bereich,
                    person: aufsicht.person
                  })}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{aufsicht.bereich}</span>
                    {aufsicht.person.abwesend && <AlertTriangle size={14} />}
                    {aufsicht.isReplacement && <Check size={14} />}
                  </div>
                  <div className="text-xs opacity-75">
                    {aufsicht.person.name}
                    {aufsicht.person.abwesend && ` (${aufsicht.person.abwesenheitsgrund})`}
                    {aufsicht.isReplacement && ` ↳ für ${aufsicht.person.originalPerson}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pausenaufsichten 1, 2, 3 */}
        {['pause1', 'pause2', 'pause3'].map((pauseKey, pauseIndex) => {
          if (pauseKey === 'pause3' && istFreitag) return null;
          if (!pausenaufsichten[pauseKey]) return null;

          return (
            <div key={pauseKey}>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Coffee size={20} />
                {pauseIndex + 1}. Pause ({pauseIndex === 0 ? '9:30-9:50' : pauseIndex === 1 ? '11:20-11:40' : '12:50-13:10'} Uhr)
              </h4>
              
              {/* Hauptaufsichten */}
              {pausenaufsichten[pauseKey].hauptaufsichten && (
                <div className="space-y-4 mb-6">
                  {Object.entries(pausenaufsichten[pauseKey].hauptaufsichten).map(([bereichsgruppe, bereiche]) => {
                    const bgColor = bereichsgruppe === 'nordflügel' ? 'bg-blue-50 dark:bg-blue-900/20' :
                                   bereichsgruppe === 'obererschulhof' ? 'bg-green-50 dark:bg-green-900/20' :
                                   bereichsgruppe === 'sportplatzwestflügel' || bereichsgruppe === 'sportplatz' ? 'bg-purple-50 dark:bg-purple-900/20' :
                                   'bg-yellow-50 dark:bg-yellow-900/20';
                    
                    const textColor = bereichsgruppe === 'nordflügel' ? 'text-blue-900 dark:text-blue-300' :
                                     bereichsgruppe === 'obererschulhof' ? 'text-green-900 dark:text-green-300' :
                                     bereichsgruppe === 'sportplatzwestflügel' || bereichsgruppe === 'sportplatz' ? 'text-purple-900 dark:text-purple-300' :
                                     'text-yellow-900 dark:text-yellow-300';

                    return (
                      <div key={bereichsgruppe} className={`${bgColor} rounded-xl p-4`}>
                        <h5 className={`font-semibold ${textColor} mb-3`}>
                          {bereichsgruppe === 'nordflügel' ? 'Rund um den Nordflügel' :
                           bereichsgruppe === 'obererschulhof' ? 'Oberer Schulhof' :
                           bereichsgruppe === 'sportplatzwestflügel' || bereichsgruppe === 'sportplatz' ? 'Sportplatz und Westflügel' :
                           'Meerschweinchen-Bereich'} ({bereiche.length} Plätze)
                        </h5>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                          {bereiche.map((aufsicht, idx) => (
                            <div
                              key={idx}
                              className={`px-3 py-2 rounded text-sm font-medium border cursor-pointer transition-all hover:shadow-md ${getPersonColor(aufsicht.person, aufsicht.isReplacement)}`}
                              onClick={() => aufsicht.person.abwesend && openReplacementModal({
                                type: 'hauptaufsicht',
                                pause: pauseIndex + 1,
                                bereich: aufsicht.bereich,
                                person: aufsicht.person
                              })}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-xs">{aufsicht.bereich}</span>
                                {aufsicht.person.abwesend && <AlertTriangle size={12} />}
                                {aufsicht.isReplacement && <Check size={12} />}
                              </div>
                              <div className="text-xs opacity-75">
                                {aufsicht.person.name}
                                {aufsicht.person.abwesend && ` (${aufsicht.person.abwesenheitsgrund})`}
                                {aufsicht.isReplacement && ` ↳ für ${aufsicht.person.originalPerson}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Einzelaufsichten */}
              {pausenaufsichten[pauseKey].einzelaufsichten && pausenaufsichten[pauseKey].einzelaufsichten.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Einzelaufsichten {pauseIndex + 1}. Pause</h5>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    {pausenaufsichten[pauseKey].einzelaufsichten.map((aufsicht, idx) => (
                      <div
                        key={idx}
                        className={`px-3 py-2 rounded text-sm font-medium border cursor-pointer transition-all hover:shadow-md ${getPersonColor(aufsicht.person, aufsicht.isReplacement)}`}
                        onClick={() => aufsicht.person.abwesend && openReplacementModal({
                          type: 'einzelaufsicht',
                          pause: pauseIndex + 1,
                          schueler: aufsicht.schueler,
                          person: aufsicht.person
                        })}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-xs">{aufsicht.schueler}</span>
                          {aufsicht.person.abwesend && <AlertTriangle size={12} />}
                          {aufsicht.isReplacement && <Check size={12} />}
                        </div>
                        <div className="text-xs opacity-75">
                          {aufsicht.person.name}
                          {aufsicht.person.abwesend && ` (${aufsicht.person.abwesenheitsgrund})`}
                          {aufsicht.isReplacement && ` ↳ für ${aufsicht.person.originalPerson}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Spätaufsicht */}
        {pausenaufsichten.spaetaufsicht && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Moon size={20} />
              Spätaufsicht (14:40-15:30 Uhr)
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {pausenaufsichten.spaetaufsicht.map((aufsicht, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-all hover:shadow-md ${getPersonColor(aufsicht.person, aufsicht.isReplacement)}`}
                  onClick={() => aufsicht.person.abwesend && openReplacementModal({
                    type: 'spaetaufsicht',
                    bereich: aufsicht.bereich,
                    person: aufsicht.person
                  })}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{aufsicht.bereich}</span>
                    {aufsicht.person.abwesend && <AlertTriangle size={14} />}
                    {aufsicht.isReplacement && <Check size={14} />}
                  </div>
                  <div className="text-xs opacity-75">
                    {aufsicht.person.name}
                    {aufsicht.person.abwesend && ` (${aufsicht.person.abwesenheitsgrund})`}
                    {aufsicht.isReplacement && ` ↳ für ${aufsicht.person.originalPerson}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ✅ REPLACEMENT MODAL
  const ReplacementModal = () => {
    if (!replacementContext) return null;
    
    const isPausenaufsicht = ['fruehaufsicht', 'spaetaufsicht', 'hauptaufsicht', 'einzelaufsicht'].includes(replacementContext.type);
    const isStundenplan = replacementContext.type === 'stundenplan';
    
    let verfuegbarePersonen = [];
    
    if (isPausenaufsicht) {
      let pausenTyp = '';
      if (replacementContext.type === 'fruehaufsicht') pausenTyp = 'fruehaufsicht';
      else if (replacementContext.type === 'spaetaufsicht') pausenTyp = 'spaetaufsicht';
      else if (replacementContext.type === 'hauptaufsicht' || replacementContext.type === 'einzelaufsicht') {
        pausenTyp = `pause${replacementContext.pause}`;
      }
      
      const ersatzPersonen = getErsatzPersonalFuerTag(replacementContext.wochentag, pausenTyp);
      const allAnderePersonen = getPersonalMitStatus().filter(p => 
        !ersatzPersonen.some(ep => ep.id === p.id) && 
        !p.abwesend && 
        p.aktiv
      );
      
      verfuegbarePersonen = [
        ...ersatzPersonen.map(p => ({ ...p, isErsatzPerson: true })),
        ...allAnderePersonen.map(p => ({ ...p, isErsatzPerson: false }))
      ];
    } else if (isStundenplan) {
      verfuegbarePersonen = getPersonalMitStatus().filter(p => 
        !p.abwesend && 
        p.aktiv
      ).map(p => ({ ...p, isErsatzPerson: false }));
    }
    
    const filteredPersonen = verfuegbarePersonen.filter(person =>
      person.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      person.typ.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
    
    const wochentagName = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][replacementContext.wochentag];
    
    const PersonCard = ({ person, isPrimary }) => {
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

      return (
        <div
          onClick={() => selectReplacement(person)}
          className={`p-3 rounded-lg border cursor-pointer transition-all hover:hover:shadow-md ${
            isPrimary 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30' 
              : 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {person.name}
                {isPrimary && <span className="text-green-600 dark:text-green-400 ml-2">⭐</span>}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {person.standorte?.join(', ')}
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${getPersonTypColor(person.typ)}`}>
              {person.typ}
            </span>
          </div>
        </div>
      );
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isPausenaufsicht ? '🚨 Pausenaufsicht-Ersatz' : '📚 Stundenplan-Ersatz'}
            </h3>
            <button 
              onClick={() => setShowReplacementModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Info-Box */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <strong>📅 {wochentagName}</strong> • {
                replacementContext.type === 'fruehaufsicht' ? 'Frühaufsicht' : 
                replacementContext.type === 'spaetaufsicht' ? 'Spätaufsicht' :
                replacementContext.type === 'hauptaufsicht' ? `${replacementContext.pause}. Pause - Hauptaufsicht` :
                replacementContext.type === 'einzelaufsicht' ? `${replacementContext.pause}. Pause - Einzelaufsicht` :
                `Stundenplan ${replacementContext.klasse} - ${replacementContext.zeit}`
              }
            </div>
            {isPausenaufsicht && (
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                💡 Primär: Ersatz-/Zusatzpersonal • Sekundär: Alle anderen
              </div>
            )}
            {isStundenplan && (
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                🔍 Freie Auswahl aus allem verfügbaren Personal
              </div>
            )}
          </div>
          
          {/* Suche */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Person suchen..."
                value={searchReplacement}
                onChange={(e) => setSearchReplacement(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoComplete="off"
                autoFocus
              />
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {filteredPersonen.length} von {verfuegbarePersonen.length} Personen
              {isPausenaufsicht && (
                <span> • {verfuegbarePersonen.filter(p => p.isErsatzPerson).length} Ersatzpersonal</span>
              )}
            </div>
          </div>

          {/* Personenliste */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredPersonen.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-medium">Keine Personen gefunden</p>
                <p className="text-sm">Versuchen Sie einen anderen Suchbegriff</p>
              </div>
            ) : (
              <>
                {isPausenaufsicht && (
                  <>
                    {filteredPersonen.filter(p => p.isErsatzPerson).length > 0 && (
                      <>
                        <div className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                          🎯 ERSATZ-/ZUSATZPERSONAL ({filteredPersonen.filter(p => p.isErsatzPerson).length})
                        </div>
                        {filteredPersonen.filter(p => p.isErsatzPerson).map(person => (
                          <PersonCard key={person.id} person={person} isPrimary={true} />
                        ))}
                      </>
                    )}
                    
                    {filteredPersonen.filter(p => !p.isErsatzPerson).length > 0 && (
                      <>
                        <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded mt-3">
                          🆘 NOTFALL-PERSONAL ({filteredPersonen.filter(p => !p.isErsatzPerson).length})
                        </div>
                        {filteredPersonen.filter(p => !p.isErsatzPerson).map(person => (
                          <PersonCard key={person.id} person={person} isPrimary={false} />
                        ))}
                      </>
                    )}
                  </>
                )}
                
                {isStundenplan && (
                  <>
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                      👥 VERFÜGBARES PERSONAL ({filteredPersonen.length})
                    </div>
                    {filteredPersonen.map(person => (
                      <PersonCard key={person.id} person={person} isPrimary={true} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
          
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 Klicken Sie auf eine Person um sie als Ersatz zu wählen
          </div>
        </div>
      </div>
    );
  };

  // ✅ VERTRETUNGSMANAGER KOMPONENTE
  const VertretungsManager = () => {
    if (!showVertretungsManager) {
      return (
        <button
          onClick={() => setShowVertretungsManager(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
          title="Vertretungen verwalten"
        >
          <Edit2 size={24} />
          {strukturierteVertretungen.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
              {strukturierteVertretungen.length}
            </span>
          )}
        </button>
      );
    }

    return (
      <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 w-96 max-h-[70vh] overflow-hidden z-40">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={20} />
              Vertretungen ({strukturierteVertretungen.length})
            </h3>
            <button
              onClick={() => setShowVertretungsManager(false)}
              className="text-white hover:bg-white/20 rounded p-1"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-purple-100 text-sm mt-1">
            {selectedDate.toLocaleDateString('de-DE')}
          </p>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          {strukturierteVertretungen.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">Keine Vertretungen</p>
              <p className="text-sm">Alle sind im regulären Einsatz</p>
            </div>
          ) : (
            <div className="space-y-3">
              {strukturierteVertretungen
                .sort((a, b) => a.zeit.localeCompare(b.zeit))
                .map((item, index) => (
                <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} className="text-gray-400" />
                        <span className="font-medium text-sm">{item.zeit}</span>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
                          {item.context.type === 'stundenplan' ? 'Unterricht' : 
                           item.context.type === 'fruehaufsicht' ? 'Frühaufsicht' :
                           item.context.type === 'spaetaufsicht' ? 'Spätaufsicht' :
                           'Pausenaufsicht'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {item.beschreibung}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditVertretung(item)}
                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        title="Bearbeiten"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteVertretung(item)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Löschen"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-red-500" />
                        <span className="line-through text-red-600 dark:text-red-400">
                          {item.originalPerson?.name || 'Unbekannt'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={12} className="text-green-500" />
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {item.ersatzPerson?.name || 'Unbekannt'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-600 p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 Klicken Sie auf <Edit2 size={12} className="inline" /> um eine Vertretung zu ändern
          </div>
        </div>
      </div>
    );
  };

  // ✅ EDIT VERTRETUNG MODAL
  const EditVertretungModal = () => {
    if (!showEditModal || !editingVertretung) return null;

    const [selectedPersonId, setSelectedPersonId] = useState(editingVertretung.ersatzPerson?.id || '');
    const [searchTerm, setSearchTerm] = useState('');

    const availablePersons = getPersonalMitStatus().filter(p => !p.abwesend && p.aktiv);
    const filteredPersons = availablePersons.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.typ.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Vertretung bearbeiten
            </h3>
            <button 
              onClick={() => {
                setShowEditModal(false);
                setEditingVertretung(null);
              }} 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          {/* Info über aktuelle Vertretung */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Aktuelle Vertretung</h4>
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <div className="mb-1">📅 {editingVertretung.beschreibung}</div>
              <div className="flex items-center justify-between">
                <span className="line-through text-red-600">👤 {editingVertretung.originalPerson?.name}</span>
                <span className="text-green-600">➜ {editingVertretung.ersatzPerson?.name}</span>
              </div>
            </div>
          </div>

          {/* Neue Person auswählen */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Neue Ersatzperson auswählen
            </label>
            <input
              type="text"
              placeholder="Person suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
            />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
            {filteredPersons.map(person => (
              <div
                key={person.id}
                onClick={() => setSelectedPersonId(person.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedPersonId === person.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {person.name}
                      {selectedPersonId === person.id && <span className="text-blue-600 ml-2">✓</span>}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {person.standorte?.join(', ')}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getPersonTypColor(person.typ)}`}>
                    {person.typ}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingVertretung(null);
              }}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Abbrechen
            </button>
            <button
              onClick={() => handleSaveEditVertretung(selectedPersonId)}
              disabled={!selectedPersonId}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:bg-gray-300 font-medium flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Speichern
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ TOAST KOMPONENTE
  const Toast = () => {
    if (!showToast) return null;

    return (
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
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6 ${isDarkMode ? 'dark' : ''}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                📅 Tagesübersicht (Vollständig - Context-System)
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {formatDate(selectedDate)}
                {istFreitag && <span className="ml-2 text-orange-600 font-medium">(Freitag - keine 3. Pause)</span>}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                ✅ Vollständige Funktionalität - Context statt dataStore Props
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                title={isDarkMode ? 'Hell-Modus aktivieren' : 'Dunkel-Modus aktivieren'}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <select
                value={selectedStufe}
                onChange={(e) => setSelectedStufe(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
              >
                <option value="alle">Alle Stufen</option>
                <option value="primarstufe">Nur Primarstufe (1-4)</option>
                <option value="sek1">Nur Sekundarstufe I (5-9)</option>
                <option value="sek2">Nur Sekundarstufe II (10-12)</option>
              </select>
              
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Aktionen
              </h2>
              <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                💾 Auto-Speicherung aktiv
              </span>
              {strukturierteVertretungen.length > 0 && (
                <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                  📝 {strukturierteVertretungen.length} Vertretung(en) heute
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={generateVertretungszettel}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium flex items-center gap-2 transition-all duration-200"
                disabled={strukturierteVertretungen.length === 0}
              >
                <FileText size={18} />
                Vertretungszettel drucken
              </button>
              
              <button
                onClick={sendVertretungsEmails}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium flex items-center gap-2 transition-all duration-200"
                disabled={strukturierteVertretungen.length === 0}
              >
                <Mail size={18} />
                Vertretungen informieren
              </button>
              
              <button
                onClick={createBackup}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 font-medium flex items-center gap-2 transition-all duration-200"
              >
                <Download size={18} />
                Backup (+ Vertretungen)
              </button>
            </div>
          </div>
        </div>

        {/* Stundenplan Tabellen */}
        {selectedStufe === 'alle' ? (
          <div className="space-y-8">
            <StundenplanTabelle klassen={klassen.primarstufe} stufeName="Primarstufe (Klassen 1-4)" />
            <StundenplanTabelle klassen={klassen.sek1} stufeName="Sekundarstufe I (Klassen 5-9)" />
            <StundenplanTabelle klassen={klassen.sek2} stufeName="Sekundarstufe II (Klassen 10-12)" />
          </div>
        ) : (
          <StundenplanTabelle 
            klassen={klassen[selectedStufe]} 
            stufeName={
              selectedStufe === 'primarstufe' ? 'Primarstufe (Klassen 1-4)' :
              selectedStufe === 'sek1' ? 'Sekundarstufe I (Klassen 5-9)' :
              'Sekundarstufe II (Klassen 10-12)'
            }
          />
        )}

        {/* Pausenaufsichten */}
        <PausenaufsichtenBereich />

        {/* ✅ VERTRETUNGSMANAGER */}
        <VertretungsManager />

        {/* Toast */}
        <Toast />
      </div>

      {/* Modals */}
      {showReplacementModal && <ReplacementModal />}
      {showEditModal && <EditVertretungModal />}
    </div>
  );
};

export default UebersichtModule;