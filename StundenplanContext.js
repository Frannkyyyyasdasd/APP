import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

// ✅ ACTIONS - Vollständig und konsistent
const ACTIONS = {
  // Personal
  UPDATE_PERSONAL: 'UPDATE_PERSONAL',
  
  // Abwesenheiten
  UPDATE_PERSONAL_ABWESENHEITEN: 'UPDATE_PERSONAL_ABWESENHEITEN',
  UPDATE_KLASSEN_ABWESENHEITEN: 'UPDATE_KLASSEN_ABWESENHEITEN',
  
  // Stundenpläne und Pausenaufsichten
  UPDATE_MASTER_STUNDENPLAENE: 'UPDATE_MASTER_STUNDENPLAENE',
  UPDATE_MASTER_PAUSENAUFSICHTEN: 'UPDATE_MASTER_PAUSENAUFSICHTEN',
  
  // Vertretungen
  UPDATE_VERTRETUNGEN: 'UPDATE_VERTRETUNGEN',
  UPDATE_ERSATZ_TABELLE: 'UPDATE_ERSATZ_TABELLE',
  
  // Klassen
  UPDATE_KLASSEN: 'UPDATE_KLASSEN',
  
  // Inklusion
  UPDATE_INKLUSIONS_SCHULEN: 'UPDATE_INKLUSIONS_SCHULEN',
  UPDATE_INKLUSIONS_SCHUELER: 'UPDATE_INKLUSIONS_SCHUELER',
  UPDATE_INKLUSIONS_BETREUUNGEN: 'UPDATE_INKLUSIONS_BETREUUNGEN',
  
  // System
  SYNC_DATA: 'SYNC_DATA'
};

// ✅ REDUCER - Vollständig und konsistent
const stundenplanReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.UPDATE_PERSONAL:
      return {
        ...state,
        personal: action.payload,
        lastUpdate: Date.now()
      };

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

    case ACTIONS.UPDATE_VERTRETUNGEN:
      return {
        ...state,
        vertretungen: action.payload,
        lastUpdate: Date.now()
      };

    case ACTIONS.UPDATE_ERSATZ_TABELLE:
      return {
        ...state,
        ersatzTabelle: action.payload,
        lastUpdate: Date.now()
      };

    case ACTIONS.UPDATE_KLASSEN:
      return {
        ...state,
        klassen: action.payload,
        lastUpdate: Date.now()
      };

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

// ✅ PROVIDER Komponente - Vollständig neu geschrieben
export const StundenplanProvider = ({ children, initialData = {} }) => {
  
  // ✅ INITIAL STATE mit sicheren Fallbacks
  const initialState = {
    // Personal
    personal: initialData.personal || [],
    personalAbwesenheiten: initialData.personalAbwesenheiten || [],
    
    // Klassen
    klassen: initialData.klassen || [],
    klassenAbwesenheiten: initialData.klassenAbwesenheiten || [],
    
    // Stundenpläne
    masterStundenplaene: initialData.masterStundenplaene || {},
    masterPausenaufsichten: initialData.masterPausenaufsichten || {},
    
    // Vertretungen
    vertretungen: initialData.vertretungen || {},
    ersatzTabelle: initialData.ersatzTabelle || {},
    
    // Inklusion
    inklusionsSchulen: initialData.inklusionsSchulen || [],
    inklusionsSchueler: initialData.inklusionsSchueler || [],
    inklusionsBetreuungen: initialData.inklusionsBetreuungen || {},
    
    // Metadaten
    lastUpdate: Date.now()
  };

  console.log('🔍 StundenplanContext initialisiert mit:', {
    personalCount: initialState.personal.length,
    klassenCount: initialState.klassen.length,
    inklusionsSchulenCount: initialState.inklusionsSchulen.length,
    hasInitialData: !!initialData.personal
  });

  const [state, dispatch] = useReducer(stundenplanReducer, initialState);

  // ✅ PERSONAL ACTIONS
  const setPersonal = useCallback((personal) => {
    const newPersonal = typeof personal === 'function' 
      ? personal(state.personal)
      : personal;
    
    console.log('🔍 setPersonal aufgerufen mit:', newPersonal?.length, 'Personen');
    dispatch({
      type: ACTIONS.UPDATE_PERSONAL,
      payload: newPersonal
    });
  }, [state.personal]);

  // ✅ ABWESENHEITEN ACTIONS
  const setPersonalAbwesenheiten = useCallback((abwesenheiten) => {
    const newAbwesenheiten = typeof abwesenheiten === 'function' 
      ? abwesenheiten(state.personalAbwesenheiten)
      : abwesenheiten;
    
    dispatch({
      type: ACTIONS.UPDATE_PERSONAL_ABWESENHEITEN,
      payload: newAbwesenheiten
    });
  }, [state.personalAbwesenheiten]);

  const setKlassenAbwesenheiten = useCallback((klassenAbwesenheiten) => {
    const newKlassenAbwesenheiten = typeof klassenAbwesenheiten === 'function' 
      ? klassenAbwesenheiten(state.klassenAbwesenheiten)
      : klassenAbwesenheiten;
    
    dispatch({
      type: ACTIONS.UPDATE_KLASSEN_ABWESENHEITEN,
      payload: newKlassenAbwesenheiten
    });
  }, [state.klassenAbwesenheiten]);

  // ✅ STUNDENPLAN ACTIONS
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

  // ✅ VERTRETUNGEN ACTIONS
  const setVertretungen = useCallback((vertretungen) => {
    const newVertretungen = typeof vertretungen === 'function' 
      ? vertretungen(state.vertretungen)
      : vertretungen;
    
    dispatch({
      type: ACTIONS.UPDATE_VERTRETUNGEN,
      payload: newVertretungen
    });
  }, [state.vertretungen]);

  const setErsatzTabelle = useCallback((ersatzTabelle) => {
    const newErsatzTabelle = typeof ersatzTabelle === 'function' 
      ? ersatzTabelle(state.ersatzTabelle)
      : ersatzTabelle;
    
    dispatch({
      type: ACTIONS.UPDATE_ERSATZ_TABELLE,
      payload: newErsatzTabelle
    });
  }, [state.ersatzTabelle]);

  // ✅ KLASSEN ACTIONS
  const setKlassen = useCallback((klassen) => {
    const newKlassen = typeof klassen === 'function' 
      ? klassen(state.klassen)
      : klassen;
    
    dispatch({
      type: ACTIONS.UPDATE_KLASSEN,
      payload: newKlassen
    });
  }, [state.klassen]);

  // ✅ INKLUSION ACTIONS
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

  // ✅ SYNC FUNCTIONS
  const syncData = useCallback(() => {
    dispatch({ type: ACTIONS.SYNC_DATA });
  }, []);

  const syncPersonalStundenplaene = useCallback(() => {
    console.log('📅 Personal-Stundenpläne synchronisiert (inkl. Inklusion)');
    dispatch({ type: ACTIONS.SYNC_DATA });
  }, []);

  // ✅ HELPER FUNCTIONS mit Error-Behandlung
  const getPersonById = useCallback((id) => {
    const person = state.personal.find(p => p.id === id);
    if (!person) {
      console.warn(`❌ Person mit ID ${id} nicht gefunden. Verfügbare IDs:`, state.personal.map(p => p.id));
    }
    return person;
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

  // ✅ INKLUSIONS HELPER FUNCTIONS
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

  // ✅ PERSONAL MIT STATUS
  const getPersonalMitStatus = useCallback(() => {
    console.log('🔍 getPersonalMitStatus aufgerufen. State.personal:', state.personal?.length || 0, 'Personen');
    
    if (!state.personal || !Array.isArray(state.personal)) {
      console.warn('❌ state.personal ist nicht definiert oder kein Array:', state.personal);
      return [];
    }

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
    setVertretungen(newVertretungen);
  }, [state.vertretungen, setVertretungen]);

  const removeVertretung = useCallback((dateKey, contextKey) => {
    const newVertretungen = { ...state.vertretungen };
    if (newVertretungen[dateKey]) {
      delete newVertretungen[dateKey][contextKey];
      
      if (Object.keys(newVertretungen[dateKey]).length === 0) {
        delete newVertretungen[dateKey];
      }
    }
    setVertretungen(newVertretungen);
  }, [state.vertretungen, setVertretungen]);

  const getVertretungenForDate = useCallback((date) => {
    const dateKey = date.toISOString().split('T')[0];
    return state.vertretungen[dateKey] || {};
  }, [state.vertretungen]);

  // ✅ DEBUG: State-Änderungen loggen
  React.useEffect(() => {
    console.log('🔍 Context State Update:', {
      personalCount: state.personal?.length || 0,
      klassenCount: state.klassen?.length || 0,
      inklusionsSchulenCount: state.inklusionsSchulen?.length || 0,
      masterStundenplaeneKeys: Object.keys(state.masterStundenplaene || {}),
      lastUpdate: new Date(state.lastUpdate).toLocaleTimeString()
    });
  }, [state]);

  // ✅ PROVIDER VALUE - Vollständig und konsistent
  const contextValue = useMemo(() => ({
    // ✅ STATE
    personal: state.personal,
    personalAbwesenheiten: state.personalAbwesenheiten,
    klassen: state.klassen,
    klassenAbwesenheiten: state.klassenAbwesenheiten,
    masterStundenplaene: state.masterStundenplaene,
    masterPausenaufsichten: state.masterPausenaufsichten,
    vertretungen: state.vertretungen,
    ersatzTabelle: state.ersatzTabelle,
    inklusionsSchulen: state.inklusionsSchulen,
    inklusionsSchueler: state.inklusionsSchueler,
    inklusionsBetreuungen: state.inklusionsBetreuungen,
    
    // ✅ ACTIONS - Alle konsistent benannt
    setPersonal,
    setPersonalAbwesenheiten,
    setKlassen,
    setKlassenAbwesenheiten,
    setMasterStundenplaene,
    setMasterPausenaufsichten,
    setVertretungen,
    setErsatzTabelle,
    setInklusionsSchulen,
    setInklusionsSchueler,
    setInklusionsBetreuungen,
    
    // ✅ SYNC FUNCTIONS
    syncData,
    syncPersonalStundenplaene,
    
    // ✅ HELPER FUNCTIONS
    getPersonalMitStatus,
    getPersonById,
    getPersonAbwesenheit,
    isPersonAbwesend,
    getAbwesenheitsgrund,
    getInklusionsSchuleById,
    getInklusionsSchuelerById,
    getBetreuungenFuerPerson,
    getBetreuungenFuerSchueler,
    
    // ✅ VERTRETUNG MANAGEMENT
    saveVertretung,
    removeVertretung,
    getVertretungenForDate,
    
    // ✅ DEPRECATED ALIASES (für Kompatibilität)
    updatePersonal: setPersonal,
    updatePersonalAbwesenheiten: setPersonalAbwesenheiten,
    updateKlassenAbwesenheiten: setKlassenAbwesenheiten,
    updateVertretungen: setVertretungen,
    
    // ✅ Stable reference für Updates
    _stableRef: state.lastUpdate
  }), [
    // State
    state,
    // Actions
    setPersonal,
    setPersonalAbwesenheiten,
    setKlassen,
    setKlassenAbwesenheiten,
    setMasterStundenplaene,
    setMasterPausenaufsichten,
    setVertretungen,
    setErsatzTabelle,
    setInklusionsSchulen,
    setInklusionsSchueler,
    setInklusionsBetreuungen,
    // Sync functions
    syncData,
    syncPersonalStundenplaene,
    // Helper functions
    getPersonalMitStatus,
    getPersonById,
    getPersonAbwesenheit,
    isPersonAbwesend,
    getAbwesenheitsgrund,
    getInklusionsSchuleById,
    getInklusionsSchuelerById,
    getBetreuungenFuerPerson,
    getBetreuungenFuerSchueler,
    // Vertretung management
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