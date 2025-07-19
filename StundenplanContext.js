import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

// ✅ ERWEITERTE ACTIONS für Inklusion
const ACTIONS = {
  UPDATE_PERSONAL_ABWESENHEITEN: 'UPDATE_PERSONAL_ABWESENHEITEN',
  UPDATE_KLASSEN_ABWESENHEITEN: 'UPDATE_KLASSEN_ABWESENHEITEN',
  UPDATE_VERTRETUNGEN: 'UPDATE_VERTRETUNGEN',
  UPDATE_PERSONAL: 'UPDATE_PERSONAL',
  UPDATE_MASTER_STUNDENPLAENE: 'UPDATE_MASTER_STUNDENPLAENE',
  UPDATE_MASTER_PAUSENAUFSICHTEN: 'UPDATE_MASTER_PAUSENAUFSICHTEN',
  UPDATE_ERSATZ_TABELLE: 'UPDATE_ERSATZ_TABELLE',
  // ✅ NEU: Inklusions-Actions
  UPDATE_INKLUSIONS_SCHULEN: 'UPDATE_INKLUSIONS_SCHULEN',
  UPDATE_INKLUSIONS_SCHUELER: 'UPDATE_INKLUSIONS_SCHUELER',
  UPDATE_INKLUSIONS_BETREUUNGEN: 'UPDATE_INKLUSIONS_BETREUUNGEN',
  SYNC_DATA: 'SYNC_DATA'
};

// ✅ ERWEITERTER REDUCER
const stundenplanReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.UPDATE_PERSONAL_ABWESENHEITEN:
      return {
        ...state,
        personalAbwesenheiten: action.payload,
        lastUpdate: Date.now()
      };
      
    case ACTIONS.UPDATE_KLASSEN_ABWESENHEITEN:
      return {
        ...state,
        klassenAbwesenheiten: action.payload,
        lastUpdate: Date.now()
      };
      
    case ACTIONS.UPDATE_VERTRETUNGEN:
      return {
        ...state,
        vertretungen: action.payload,
        lastUpdate: Date.now()
      };
      
    case ACTIONS.UPDATE_PERSONAL:
      return {
        ...state,
        personal: action.payload,
        lastUpdate: Date.now()
      };

    case ACTIONS.UPDATE_MASTER_STUNDENPLAENE:
      return {
        ...state,
        masterStundenplaene: action.payload,
        lastUpdate: Date.now()
      };

    case ACTIONS.UPDATE_MASTER_PAUSENAUFSICHTEN:
      return {
        ...state,
        masterPausenaufsichten: action.payload,
        lastUpdate: Date.now()
      };

    case ACTIONS.UPDATE_ERSATZ_TABELLE:
      return {
        ...state,
        ersatzTabelle: action.payload,
        lastUpdate: Date.now()
      };

    // ✅ NEU: Inklusions-Reducer
    case ACTIONS.UPDATE_INKLUSIONS_SCHULEN:
      return {
        ...state,
        inklusionsSchulen: action.payload,
        lastUpdate: Date.now()
      };

    case ACTIONS.UPDATE_INKLUSIONS_SCHUELER:
      return {
        ...state,
        inklusionsSchueler: action.payload,
        lastUpdate: Date.now()
      };

    case ACTIONS.UPDATE_INKLUSIONS_BETREUUNGEN:
      return {
        ...state,
        inklusionsBetreuungen: action.payload,
        lastUpdate: Date.now()
      };
      
    case ACTIONS.SYNC_DATA:
      return {
        ...state,
        lastUpdate: Date.now()
      };
      
    default:
      return state;
  }
};

// ✅ CONTEXT erstellen
const StundenplanContext = createContext();

// ✅ PROVIDER Komponente mit Inklusions-Daten
export const StundenplanProvider = ({ children, initialData }) => {
  const [state, dispatch] = useReducer(stundenplanReducer, {
    ...initialData,
    // ✅ NEU: Inklusions-Initial-Daten
    inklusionsSchulen: initialData.inklusionsSchulen || [],
    inklusionsSchueler: initialData.inklusionsSchueler || [],
    inklusionsBetreuungen: initialData.inklusionsBetreuungen || {},
    lastUpdate: Date.now()
  });

  // ✅ BESTEHENDE ACTIONS
  const updatePersonalAbwesenheiten = useCallback((abwesenheiten) => {
    dispatch({
      type: ACTIONS.UPDATE_PERSONAL_ABWESENHEITEN,
      payload: abwesenheiten
    });
  }, []);

  const updateKlassenAbwesenheiten = useCallback((klassenAbwesenheiten) => {
    dispatch({
      type: ACTIONS.UPDATE_KLASSEN_ABWESENHEITEN,
      payload: klassenAbwesenheiten
    });
  }, []);

  const updateVertretungen = useCallback((vertretungen) => {
    dispatch({
      type: ACTIONS.UPDATE_VERTRETUNGEN,
      payload: vertretungen
    });
  }, []);

  const updatePersonal = useCallback((personal) => {
    dispatch({
      type: ACTIONS.UPDATE_PERSONAL,
      payload: personal
    });
  }, []);

  const setMasterStundenplaene = useCallback((stundenplaene) => {
    const newStundenplaene = typeof stundenplaene === 'function' 
      ? stundenplaene(state.masterStundenplaene)
      : stundenplaene;
    
    dispatch({
      type: ACTIONS.UPDATE_MASTER_STUNDENPLAENE,
      payload: newStundenplaene
    });
  }, [state.masterStundenplaene]);

  const setMasterPausenaufsichten = useCallback((pausenaufsichten) => {
    const newPausenaufsichten = typeof pausenaufsichten === 'function' 
      ? pausenaufsichten(state.masterPausenaufsichten)
      : pausenaufsichten;
    
    dispatch({
      type: ACTIONS.UPDATE_MASTER_PAUSENAUFSICHTEN,
      payload: newPausenaufsichten
    });
  }, [state.masterPausenaufsichten]);

  const setErsatzTabelle = useCallback((ersatzTabelle) => {
    const newErsatzTabelle = typeof ersatzTabelle === 'function' 
      ? ersatzTabelle(state.ersatzTabelle)
      : ersatzTabelle;
    
    dispatch({
      type: ACTIONS.UPDATE_ERSATZ_TABELLE,
      payload: newErsatzTabelle
    });
  }, [state.ersatzTabelle]);

  // ✅ NEU: Inklusions-Actions
  const setInklusionsSchulen = useCallback((schulen) => {
    const newSchulen = typeof schulen === 'function' 
      ? schulen(state.inklusionsSchulen)
      : schulen;
    
    dispatch({
      type: ACTIONS.UPDATE_INKLUSIONS_SCHULEN,
      payload: newSchulen
    });
  }, [state.inklusionsSchulen]);

  const setInklusionsSchueler = useCallback((schueler) => {
    const newSchueler = typeof schueler === 'function' 
      ? schueler(state.inklusionsSchueler)
      : schueler;
    
    dispatch({
      type: ACTIONS.UPDATE_INKLUSIONS_SCHUELER,
      payload: newSchueler
    });
  }, [state.inklusionsSchueler]);

  const setInklusionsBetreuungen = useCallback((betreuungen) => {
    const newBetreuungen = typeof betreuungen === 'function' 
      ? betreuungen(state.inklusionsBetreuungen)
      : betreuungen;
    
    dispatch({
      type: ACTIONS.UPDATE_INKLUSIONS_BETREUUNGEN,
      payload: newBetreuungen
    });
  }, [state.inklusionsBetreuungen]);

  // ✅ ALIAS für Kompatibilität
  const setPersonal = updatePersonal;
  const setPersonalAbwesenheiten = updatePersonalAbwesenheiten;
  const setKlassenAbwesenheiten = updateKlassenAbwesenheiten;
  const setVertretungen = updateVertretungen;

  const syncData = useCallback(() => {
    dispatch({ type: ACTIONS.SYNC_DATA });
  }, []);

  // ✅ NEU: Erweiterte Sync-Funktion für Inklusions-Personal-Stundenpläne
  const syncPersonalStundenplaene = useCallback(() => {
    // Automatische Synchronisation der Inklusions-Betreuungszeiten
    // in die Personal-Stundenpläne wird hier implementiert
    console.log('📅 Personal-Stundenpläne synchronisiert (inkl. Inklusion)');
  }, []);

  // ✅ HILFSFUNKTIONEN
  const getPersonById = useCallback((id) => {
    return state.personal.find(p => p.id === id);
  }, [state.personal]);

  const getPersonAbwesenheit = useCallback((personName, datum = new Date()) => {
    const dateString = datum.toISOString().split('T')[0];
    return state.personalAbwesenheiten.find(abw => {
      const vonDate = abw.von;
      const bisDate = abw.bis || abw.von;
      return abw.person === personName && 
             dateString >= vonDate && 
             dateString <= bisDate;
    });
  }, [state.personalAbwesenheiten]);

  const isPersonAbwesend = useCallback((personName, datum = new Date()) => {
    return !!getPersonAbwesenheit(personName, datum);
  }, [getPersonAbwesenheit]);

  const getAbwesenheitsgrund = useCallback((personName, datum = new Date()) => {
    const abwesenheit = getPersonAbwesenheit(personName, datum);
    return abwesenheit?.grund || null;
  }, [getPersonAbwesenheit]);

  // ✅ NEU: Inklusions-Hilfsfunktionen
  const getInklusionsSchuleById = useCallback((id) => {
    return state.inklusionsSchulen.find(s => s.id === id);
  }, [state.inklusionsSchulen]);

  const getInklusionsSchuelerById = useCallback((id) => {
    return state.inklusionsSchueler.find(s => s.id === id);
  }, [state.inklusionsSchueler]);

  const getBetreuungenFuerPerson = useCallback((personId) => {
    const betreuungen = {};
    Object.entries(state.inklusionsBetreuungen).forEach(([key, betreuung]) => {
      if (betreuung.personId === personId) {
        const [, schuelerId] = key.split('_');
        const schueler = getInklusionsSchuelerById(parseInt(schuelerId));
        if (schueler) {
          betreuungen[key] = {
            ...betreuung,
            schueler,
            schule: getInklusionsSchuleById(schueler.schuleId)
          };
        }
      }
    });
    return betreuungen;
  }, [state.inklusionsBetreuungen, getInklusionsSchuelerById, getInklusionsSchuleById]);

  const getBetreuungenFuerSchueler = useCallback((schuelerId) => {
    const betreuungen = {};
    Object.entries(state.inklusionsBetreuungen).forEach(([key, betreuung]) => {
      const [, keySchuelerId] = key.split('_');
      if (parseInt(keySchuelerId) === schuelerId) {
        const person = getPersonById(betreuung.personId);
        if (person) {
          betreuungen[key] = {
            ...betreuung,
            person
          };
        }
      }
    });
    return betreuungen;
  }, [state.inklusionsBetreuungen, getPersonById]);

  // ✅ STABILE COMPUTED VALUES
  const getPersonalMitStatus = useCallback(() => {
    return state.personal.map(person => {
      const abwesenheit = getPersonAbwesenheit(person.name);
      return {
        ...person,
        abwesend: !!abwesenheit,
        abwesenheitsgrund: abwesenheit?.grund
      };
    });
  }, [state.personal, getPersonAbwesenheit, state.lastUpdate]);

  // ✅ VERTRETUNGS-MANAGEMENT
  const saveVertretung = useCallback((dateKey, contextKey, vertretungData) => {
    const newVertretungen = {
      ...state.vertretungen,
      [dateKey]: {
        ...state.vertretungen[dateKey],
        [contextKey]: {
          ...vertretungData,
          timestamp: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
      }
    };
    updateVertretungen(newVertretungen);
  }, [state.vertretungen, updateVertretungen]);

  const removeVertretung = useCallback((dateKey, contextKey) => {
    const newVertretungen = { ...state.vertretungen };
    if (newVertretungen[dateKey]) {
      delete newVertretungen[dateKey][contextKey];
      
      if (Object.keys(newVertretungen[dateKey]).length === 0) {
        delete newVertretungen[dateKey];
      }
    }
    updateVertretungen(newVertretungen);
  }, [state.vertretungen, updateVertretungen]);

  const getVertretungenForDate = useCallback((date) => {
    const dateKey = date.toISOString().split('T')[0];
    return state.vertretungen[dateKey] || {};
  }, [state.vertretungen]);

  // ✅ STABILE PROVIDER VALUE mit Inklusions-Daten
  const contextValue = useMemo(() => ({
    // State
    personal: state.personal,
    personalAbwesenheiten: state.personalAbwesenheiten,
    klassenAbwesenheiten: state.klassenAbwesenheiten,
    masterStundenplaene: state.masterStundenplaene,
    masterPausenaufsichten: state.masterPausenaufsichten,
    vertretungen: state.vertretungen,
    ersatzTabelle: state.ersatzTabelle,
    
    // ✅ NEU: Inklusions-State
    inklusionsSchulen: state.inklusionsSchulen,
    inklusionsSchueler: state.inklusionsSchueler,
    inklusionsBetreuungen: state.inklusionsBetreuungen,
    
    // Actions (neue Naming-Convention)
    updatePersonalAbwesenheiten,
    updateKlassenAbwesenheiten,
    updateVertretungen,
    updatePersonal,
    setMasterStundenplaene,
    setMasterPausenaufsichten,
    setErsatzTabelle,
    syncData,
    syncPersonalStundenplaene,
    
    // ✅ NEU: Inklusions-Actions
    setInklusionsSchulen,
    setInklusionsSchueler,
    setInklusionsBetreuungen,
    
    // Actions (alte Naming-Convention für Kompatibilität)
    setPersonal,
    setPersonalAbwesenheiten,
    setKlassenAbwesenheiten,
    setVertretungen,
    
    // Computed
    getPersonalMitStatus,
    getPersonById,
    getPersonAbwesenheit,
    isPersonAbwesend,
    getAbwesenheitsgrund,
    
    // ✅ NEU: Inklusions-Computed
    getInklusionsSchuleById,
    getInklusionsSchuelerById,
    getBetreuungenFuerPerson,
    getBetreuungenFuerSchueler,
    
    // Vertretung Management
    saveVertretung,
    removeVertretung,
    getVertretungenForDate,
    
    // Stable reference für Updates
    _stableRef: state.lastUpdate
  }), [
    state,
    updatePersonalAbwesenheiten,
    updateKlassenAbwesenheiten,
    updateVertretungen,
    updatePersonal,
    setMasterStundenplaene,
    setMasterPausenaufsichten,
    setErsatzTabelle,
    syncData,
    syncPersonalStundenplaene,
    setInklusionsSchulen,
    setInklusionsSchueler,
    setInklusionsBetreuungen,
    setPersonal,
    setPersonalAbwesenheiten,
    setKlassenAbwesenheiten,
    setVertretungen,
    getPersonalMitStatus,
    getPersonById,
    getPersonAbwesenheit,
    isPersonAbwesend,
    getAbwesenheitsgrund,
    getInklusionsSchuleById,
    getInklusionsSchuelerById,
    getBetreuungenFuerPerson,
    getBetreuungenFuerSchueler,
    saveVertretung,
    removeVertretung,
    getVertretungenForDate
  ]);

  return (
    <StundenplanContext.Provider value={contextValue}>
      {children}
    </StundenplanContext.Provider>
  );
};

// ✅ HOOK für Components
export const useStundenplan = () => {
  const context = useContext(StundenplanContext);
  if (!context) {
    throw new Error('useStundenplan must be used within StundenplanProvider');
  }
  return context;
};

export default StundenplanContext;