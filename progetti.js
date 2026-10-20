// Le schede della pagina: una voce per progetto, nell'ordine in cui si vedono.
// data: AAAA-MM-GG. trailer e scarica: i link di «Copia link» di Drive; vuoti, la scheda mostra «in arrivo».
const PROGETTI = [
  {
    id: 'tracker-brani',
    nome: 'tracker-brani',
    frase: 'Una board per i tuoi brani che gira nel browser del computer: niente da installare, niente va su internet.',
    versione: '2026-10-16b',
    data: '2026-10-19',
    sistemi: ['Computer, non telefono', 'Chrome o Edge'],
    istruzioni: [
      'Estrai lo zip e metti la cartella tracker-brani in un posto tuo, per esempio Documenti.',
      'Apri index.html con Chrome o Edge, sempre lo stesso: tasto destro, «Apri con».',
      'Alla prima apertura trovi una presentazione, tre domande e un giro di nove passi.',
      'I brani restano nel browser di quel computer: «Esporta tutto», dal bottone col pallino in alto a destra, ne scarica una copia.',
      'Niente brani sotto mano? In kit-prova c\'è una board di esempio da importare. Qualcosa non va: menu «?», «Segnala…».'
    ],
    trailer: 'https://drive.google.com/file/d/10v4L-stwDurVjfiwLWDpIKi_aifKRsCB/view?usp=drive_link',
    scarica: 'https://drive.google.com/file/d/11UvtxqH68slIZbFRk3RR-t6Bj89gaaKC/view?usp=drive_link'
  },
  {
    id: 'guida-secondo-cervello',
    nome: 'Costruire un secondo cervello per lavorare con un agente',
    frase: 'Una guida per lavorare con un agente di intelligenza artificiale per mesi, senza perdere il filo.',
    versione: '2026-10-19',
    data: '2026-10-19',
    sistemi: ['Computer', 'Browser, senza rete'],
    istruzioni: [
      'Estrai lo zip e metti la cartella guida-secondo-cervello dove vuoi.',
      'Apri guida.html con un doppio clic: la guida intera in una pagina del browser.',
      'Parti da uno dei quattro percorsi di lettura, o leggi tutto di fila.',
      'Gli ultimi due capitoli hanno un lucchetto: la parola d\'ordine sta nella guida.',
      'In modelli ci sono gli otto file da copiare per costruire il tuo.'
    ],
    trailer: 'https://drive.google.com/file/d/1vZdEN6hOW6NHdXWc9Jnrw0zXiI8NFiii/view?usp=drive_link',
    scarica: 'https://drive.google.com/file/d/1lWcHe3t9jXzAl3hSPJHtEvVARd3cMbxB/view?usp=drive_link'
  },
  {
    id: 'template-evento',
    nome: 'Template di evento',
    frase: 'Il documento per organizzare un evento live, in sei sezioni: gira nel browser, senza rete e senza installare niente.',
    versione: '2026-10-20',
    data: '2026-10-20',
    sistemi: ['Computer', 'Chrome, Edge, Safari o Firefox, senza rete'],
    istruzioni: [
      'Estrai lo zip e metti la cartella template-evento dove vuoi.',
      'Apri evento.html con un doppio clic: si apre nel browser, senza rete e senza installare niente.',
      'Per provarlo con un evento già scritto, «Apri JSON» e scegli kit-prova/evento-esempio.json; in Chrome e in Edge «Salva JSON» ci scrive sopra, quindi aprine una copia se vuoi tenerlo com\'è.',
      'Per un evento tuo, «Nuovo evento» e poi «Salva JSON»: il lavoro sta nel file JSON, non nella pagina. In Safari e in Firefox il file salvato finisce nei Download.',
      'Il pulsante «Guida» spiega il resto. Un\'idea o un errore: «Segnala…» nella pagina, e mandami il testo.'
    ],
    trailer: 'https://drive.google.com/file/d/1kp6VBonjMjLKTggifzF3PIszrCwnZ4Qs/view?usp=drive_link',
    scarica: 'https://drive.google.com/file/d/1q1h98Zuobl7NC2V-ARwGi9tRCH-JnIhX/view?usp=drive_link'
  }
];
