const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.ELECTRON_IS_DEV === 'true';

let mainWindow;

function createWindow() {
  // Hauptfenster erstellen
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'icon.png'), // Optional: App-Icon
    show: false // Erst anzeigen wenn ready
  });

  // React App laden
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
    
  mainWindow.loadURL(startUrl);

  // DevTools in Entwicklungsumgebung öffnen
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Fenster anzeigen wenn bereit
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // App beenden wenn Hauptfenster geschlossen wird
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Menüleiste erstellen
function createMenu() {
  const template = [
    {
      label: 'Datei',
      submenu: [
        {
          label: 'Neuer Stundenplan',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // TODO: Neue Stundenplan Funktion
          }
        },
        {
          label: 'Öffnen',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            // TODO: Öffnen Funktion
          }
        },
        {
          label: 'Speichern',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-save');
          }
        },
        { type: 'separator' },
        {
          label: 'Drucken',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.send('menu-print');
          }
        },
        { type: 'separator' },
        {
          label: 'Beenden',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Bearbeiten',
      submenu: [
        { label: 'Rückgängig', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Wiederholen', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Ausschneiden', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Kopieren', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Einfügen', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'Ansicht',
      submenu: [
        { label: 'Neu laden', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Entwicklertools', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Vollbild', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Module',
      submenu: [
        {
          label: 'Übersicht',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'uebersicht');
          }
        },
        {
          label: 'Abwesenheiten',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'abwesenheiten');
          }
        },
        {
          label: 'Stundenplanplanung',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'stundenplanung');
          }
        },
        {
          label: 'Personal',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'personal');
          }
        },
        {
          label: 'Pausenaufsicht',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'pausenaufsicht');
          }
        },
        {
          label: 'Klassen',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'klassen');
          }
        },
        {
          label: 'Inklusion',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'inklusion');
          }
        }
      ]
    },
    {
      label: 'Hilfe',
      submenu: [
        {
          label: 'Über Stundenplan Verwaltung',
          click: () => {
            // TODO: Über Dialog
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App Event Handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers für Kommunikation mit Renderer
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});