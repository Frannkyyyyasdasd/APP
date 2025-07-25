// appConstants.js - Zentrale Konstanten für die Stundenplan-App

export const WOCHENTAGE_KEYS = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag'];
export const WOCHENTAGE_NAMEN = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

export const ZEITSLOTS_STANDARD = [
  '08:00-08:45', '08:45-09:30', '09:50-10:35', '10:35-11:20', 
  '11:40-12:50', '13:10-13:55', '13:55-14:40', '14:40-15:30'
];

export const SCHULSTUFEN_ALLGEMEIN = ['Primarstufe', 'Sekundarstufe I', 'Sekundarstufe II'];

// ✅ NEU: Alias für UebersichtModule.js Kompatibilität
export const SCHULSTUFEN_TYPEN = SCHULSTUFEN_ALLGEMEIN;

export const STANDORTE_ALLGEMEIN = [
  'OBS', 'Bürgerstraße', 'Johannes Selenka Schule', 'Böcklinstraße', 'Sidonienstraße', 'Hoffmann von Fallersleben', 'Volkmarode'
];

export const PERSON_TYPEN_MAP = {
  'LT': 'Leitung',
  'LK': 'Lehrkraft',
  'PF': 'Päd. Fachkraft',
  'LiVD': 'Lehrkraft i.V.',
  'TP': 'Therapeut*in',
  'P': 'Praktikant*in'
};

export const KLASSEN_STRUKTUR_STANDARD = {
  primarstufe: [
    { name: '1a', standort: 'OBS', stufe: 'Primarstufe' },
    { name: '1b', standort: 'OBS', stufe: 'Primarstufe' },
    { name: '1c', standort: 'OBS', stufe: 'Primarstufe' },
    { name: '1d', standort: 'Volkmarode', stufe: 'Primarstufe' },
    { name: '2a', standort: 'OBS', stufe: 'Primarstufe' },
    { name: '2b', standort: 'OBS', stufe: 'Primarstufe' },
    { name: '2d', standort: 'Volkmarode', stufe: 'Primarstufe' },
    { name: '3a', standort: 'OBS', stufe: 'Primarstufe' },
    { name: '3b', standort: 'OBS', stufe: 'Primarstufe' },
    { name: '3d', standort: 'Bürgerstraße', stufe: 'Primarstufe' },
    { name: '4a', standort: 'OBS', stufe: 'Primarstufe' },
    { name: '4b', standort: 'OBS', stufe: 'Primarstufe' },
    { name: '4d', standort: 'Bürgerstraße', stufe: 'Primarstufe' }
  ],
  sek1: [
    { name: '5a', standort: 'OBS', stufe: 'Sekundarstufe I' },
    { name: '5b', standort: 'OBS', stufe: 'Sekundarstufe I' },
    { name: '5e', standort: 'Sidonienstraße', stufe: 'Sekundarstufe I' },
    { name: '6a', standort: 'Böcklinstraße', stufe: 'Sekundarstufe I' },
    { name: '6b', standort: 'Böcklinstraße', stufe: 'Sekundarstufe I' },
    { name: '6d', standort: 'Böcklinstraße', stufe: 'Sekundarstufe I' },
    { name: '6f', standort: 'HvF', stufe: 'Sekundarstufe I' },
    { name: '7a', standort: 'Sidonienstraße', stufe: 'Sekundarstufe I' },
    { name: '7b', standort: 'Böcklinstraße', stufe: 'Sekundarstufe I' },
    { name: '7c', standort: 'OBS', stufe: 'Sekundarstufe I' },
    { name: '8a', standort: 'OBS', stufe: 'Sekundarstufe I' },
    { name: '8b', standort: 'OBS', stufe: 'Sekundarstufe I' },
    { name: '9a', standort: 'OBS', stufe: 'Sekundarstufe I' },
    { name: '9b', standort: 'OBS', stufe: 'Sekundarstufe I' },
    { name: '9c', standort: 'OBS', stufe: 'Sekundarstufe I' },
    { name: '9d', standort: 'OBS', stufe: 'Sekundarstufe I' }
  ],
  sek2: [
    { name: '10a', standort: 'OBS', stufe: 'Sekundarstufe II' },
    { name: '10b', standort: 'OBS', stufe: 'Sekundarstufe II' },
    { name: '10c', standort: 'OBS', stufe: 'Sekundarstufe II' },
    { name: '11a', standort: 'OBS', stufe: 'Sekundarstufe II' },
    { name: '11b', standort: 'OBS', stufe: 'Sekundarstufe II' },
    { name: '12b', standort: 'OBS', stufe: 'Sekundarstufe II' },
    { name: 'Koop JSS', standort: 'Johannes Selenka', stufe: 'Sekundarstufe II' }
  ]
};

export const CHART_CONFIG = {
  startHour: 8,
  endHour: 16,
  pixelsPerHour: 45,
  get totalMinutes() {
    return (this.endHour - this.startHour) * 60;
  },
  get totalHeight() {
    return (this.endHour - this.startHour) * this.pixelsPerHour;
  }
};

export const EMAILJS_CONFIG_PUBLIC = {
  serviceId: 'service_stundenplan',
  templateId: 'template_vertretung',
  publicKey: 'your_public_key' // HINWEIS: ERSETZEN SIE DIESEN PLATZHALTER MIT IHREM ECHTEN PUBLIC KEY VON EMAILJS!
};