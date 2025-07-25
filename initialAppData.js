const initialAppData = {
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
      von: '2025-07-16', // Beispiel: Heute's Datum für sofortigen Test
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
      von: '2025-07-16', // Beispiel: Heute's Datum für sofortigen Test
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

  vertretungen: {}, // Für persistente Vertretungen (initial leer)

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
      pause3: null, // Keine 3. Pause am Freitag
      fruehaufsicht: ['Lisa Wagner', 'Michael Klein'],
      spaetaufsicht: ['Anna Schmidt', 'Thomas Mueller']
    }
  },

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
  },
  klassen: [
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
      zugeordnetePersonen: [],
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
      zugeordnetePersonen: [],
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
      zugeordnetePersonen: [],
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
      zugeordnetePersonen: [],
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
      zugeordnetePersonen: [],
      bemerkungen: 'Außenstelle - besondere Betreuung'
    }
  ]
};

export default initialAppData;