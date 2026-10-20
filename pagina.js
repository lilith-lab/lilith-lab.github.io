// Testi dell'interfaccia: per un'altra lingua si cambia questo oggetto e basta.
const TESTI = {
  marchio: 'lilith lab',
  sottotitolo: 'progetti da provare',
  barraMarchio: 'lilith lab',
  menuApri: 'Progetti',
  fasciaTitolo: 'ALPHA · LAVORI IN CORSO',
  fasciaTesto: 'Versioni in sviluppo, da provare così come sono: ogni segnalazione aiuta a migliorarle.',
  presentazione: 'Per ogni progetto trovi il trailer, i primi passi, il pacchetto da scaricare e la cartella dove caricare i feedback. Trailer, download e cartella si aprono con l\'account Google a cui è arrivato l\'invito.',
  etichetta: 'alpha · ',
  consegna: 'consegna del ',
  sistemi: 'Sistemi',
  istruzioni: 'Come si usa',
  scarica: 'Scarica',
  scaricaSpento: 'Scarica · in arrivo',
  feedback: 'Carica un feedback',
  feedbackSpento: 'Feedback · in arrivo',
  trailerSpento: 'trailer in arrivo',
  trailerApri: 'Apri il trailer su Drive',
  trailerTitolo: 'Trailer di ',
  trailerAvvia: '▶ avvia il trailer',
  criptatoTitolo: '▓▓▓ ACCESSO NEGATO ▓▓▓',
  criptatoSotto: 'materiale criptato',
  criptatoTesto: 'Mi spiace, non hai accesso a questo materiale.',
  criptatoInvito: '› Hai l\'invito? Clicca ed entra con quell\'account Google.',
  portaSigla: '▓▓ ACCESSO RISERVATO ▓▓',
  // Il benvenuto in due righe, con l'a capo nel testo: nell'intro la seconda arriva dopo la prima.
  portaBenvenuto: 'benvenuto straniero.\no dovrei chiamarti: l\'eletto',
  portaBussa: 'premi per entrare',
  portaApri: 'Apri la porta',
  suoniAccesi: '♪ suoni accesi',
  suoniSpenti: '♪ suoni spenti',
  suoniIcona: '♪',
  piede: 'lilith lab · versioni alpha su invito',
  mesi: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
};

const MODELLO_DATA = /^\d{4}-\d{2}-\d{2}$/;
// La forma di «Copia link» di Drive: https://drive.google.com/file/d/<id>/view?usp=sharing
const MODELLO_DRIVE = /^https:\/\/drive\.google\.com\/file\/d\/([\w-]+)\/view(\?[^#\s]*)?$/;
// La forma di «Copia link» di una cartella di Drive: https://drive.google.com/drive/folders/<id>?usp=sharing
const MODELLO_CARTELLA = /^https:\/\/drive\.google\.com\/drive\/folders\/([\w-]+)(\?[^#\s]*)?$/;

// La data si guarda col modello prima di leggerla, e si legge in UTC perché il fuso non sposti il giorno.
function scriviData(testo) {
  if (!MODELLO_DATA.test(testo)) return testo;
  const [anno, mese, giorno] = testo.split('-').map(Number);
  const data = new Date(Date.UTC(anno, mese - 1, giorno));
  if (data.getUTCMonth() !== mese - 1 || data.getUTCDate() !== giorno) return testo;
  return giorno + ' ' + TESTI.mesi[mese - 1] + ' ' + anno;
}

function crea(tag, classe, testo) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (testo !== undefined) el.textContent = testo;
  return el;
}

function linkEsterno(indirizzo, testo, classe) {
  const link = crea('a', classe, testo);
  link.href = indirizzo;
  link.target = '_blank';
  link.rel = 'noopener';
  return link;
}

const idScheda = voce => 'scheda-' + voce.id;

// Un trailer alla volta: il riquadro di Drive si carica solo al clic sulla copertina, e quello aperto prima torna
// copertina. Tre riquadri caricati insieme, e ricaricati per fermarli, si contendevano la rete.
let trailerAperto = null;

// La riga cifrata: i primi caratteri dell'id di Drive in esadecimale, sempre gli stessi per la stessa scheda.
function rigaCifrata(id) {
  const cifre = [...id.slice(0, 12)].map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join('');
  return (cifre.match(/.{1,4}/g) || []).join(' ');
}

function disegnaCopertina(voce, id) {
  const copertina = crea('button', 'trailer-riquadro trailer-copertina');
  copertina.type = 'button';
  copertina.dataset.id = id;
  copertina.title = TESTI.trailerTitolo + voce.nome;
  copertina.addEventListener('click', () => apriTrailer(copertina));
  segnaAccesso(copertina, 'attesa');
  provaAccesso(copertina);
  return copertina;
}

// Tre stati: attesa, si, no. Nello stato no la copertina dice che il materiale è criptato, ma resta cliccabile:
// in Safari l'anteprima non arriva nemmeno a chi è invitato, e il riquadro di Drive sì.
function segnaAccesso(copertina, stato, anteprima) {
  copertina.dataset.accesso = stato;
  if (stato === 'no') {
    copertina.style.backgroundImage = '';
    copertina.replaceChildren(
      crea('span', 'copertina-titolo', TESTI.criptatoTitolo),
      crea('span', 'copertina-sotto', TESTI.criptatoSotto),
      crea('span', 'copertina-cifre', rigaCifrata(copertina.dataset.id)),
      crea('span', 'copertina-testo', TESTI.criptatoTesto),
      crea('span', 'copertina-invito', TESTI.criptatoInvito)
    );
    return;
  }
  copertina.style.backgroundImage = anteprima ? 'url("' + anteprima + '")' : '';
  copertina.replaceChildren(crea('span', 'copertina-avvia', TESTI.trailerAvvia));
}

// L'anteprima di Drive arriva solo a chi ha accesso al file, e in Safari a nessuno: arrivata è una certezza, mancata no.
function provaAccesso(copertina) {
  const anteprima = new Image();
  anteprima.onload = () => segnaAccesso(copertina, 'si', anteprima.src);
  anteprima.onerror = () => segnaAccesso(copertina, 'no');
  anteprima.src = 'https://drive.google.com/thumbnail?id=' + copertina.dataset.id + '&sz=w640';
}

function apriTrailer(copertina) {
  chiudiTrailer();
  const cornice = crea('iframe', 'trailer-riquadro');
  cornice.src = 'https://drive.google.com/file/d/' + copertina.dataset.id + '/preview';
  cornice.title = copertina.title;
  cornice.setAttribute('allowfullscreen', '');
  copertina.replaceWith(cornice);
  trailerAperto = { cornice, copertina };
}

function chiudiTrailer() {
  if (trailerAperto) trailerAperto.cornice.replaceWith(trailerAperto.copertina);
  trailerAperto = null;
}

function disegnaTrailer(voce) {
  const parte = crea('div', 'trailer');
  parte.dataset.parte = 'trailer';
  if (!voce.trailer) {
    parte.append(crea('div', 'trailer-riquadro trailer-spento', TESTI.trailerSpento));
    return parte;
  }
  const drive = MODELLO_DRIVE.exec(voce.trailer);
  if (drive) parte.append(disegnaCopertina(voce, drive[1]));
  parte.append(linkEsterno(voce.trailer, TESTI.trailerApri, 'trailer-apri'));
  return parte;
}

// Un bottone d'azione: link quando c'è l'indirizzo, spento e «in arrivo» quando manca.
function disegnaAzione(indirizzo, testo, testoSpento, classe, parte) {
  let bottone;
  if (!indirizzo) {
    bottone = crea('span', classe + ' ' + classe + '-spento', testoSpento);
    bottone.setAttribute('aria-disabled', 'true');
  } else {
    bottone = linkEsterno(indirizzo, testo, classe);
  }
  bottone.dataset.parte = parte;
  return bottone;
}

function disegnaScarica(voce) {
  return disegnaAzione(voce.scarica, TESTI.scarica, TESTI.scaricaSpento, 'scarica', 'scarica');
}

// La cartella di Drive dove si carica il file di feedback del progetto; un link in un'altra forma non si usa.
function linkFeedback(voce) {
  return MODELLO_CARTELLA.test(voce.feedback || '') ? voce.feedback : '';
}

function disegnaFeedback(voce) {
  return disegnaAzione(linkFeedback(voce), TESTI.feedback, TESTI.feedbackSpento, 'feedback', 'feedback');
}

function disegnaElenco(tag, classe, titolo, voci, parte) {
  const sezione = crea('section', 'scheda-' + parte);
  sezione.dataset.parte = parte;
  const elenco = crea(tag, classe);
  voci.forEach(testo => elenco.append(crea('li', '', testo)));
  sezione.append(crea('h3', 'titoletto', titolo), elenco);
  return sezione;
}

function disegnaScheda(voce) {
  const scheda = crea('article', 'scheda');
  scheda.id = idScheda(voce);
  scheda.dataset.id = voce.id;

  const versione = crea('p', 'scheda-versione');
  versione.dataset.parte = 'versione';
  versione.append(
    crea('span', 'etichetta', TESTI.etichetta + voce.versione),
    crea('span', 'data', TESTI.consegna + scriviData(voce.data))
  );

  const nome = crea('h2', 'scheda-nome', voce.nome);
  nome.dataset.parte = 'nome';
  const frase = crea('p', 'scheda-frase', voce.frase);
  frase.dataset.parte = 'frase';

  const azioni = crea('div', 'scheda-azioni');
  azioni.append(disegnaScarica(voce), disegnaFeedback(voce));

  scheda.append(
    versione,
    nome,
    frase,
    disegnaTrailer(voce),
    disegnaElenco('ul', 'sistemi', TESTI.sistemi, voce.sistemi, 'sistemi'),
    disegnaElenco('ol', 'passi', TESTI.istruzioni, voce.istruzioni, 'istruzioni'),
    azioni
  );
  return scheda;
}

// Svuota il contenitore e ridisegna una scheda per voce.
function disegnaSchede(elenco, contenitore = document.getElementById('schede')) {
  contenitore.replaceChildren(...elenco.map(disegnaScheda));
}

// Il menù dei progetti: una voce per progetto, un link alla sua scheda.
function disegnaMenu(elenco, contenitore = document.getElementById('menu-elenco')) {
  contenitore.replaceChildren(...elenco.map(voce => {
    const riga = crea('li');
    const link = crea('a', 'menu-voce', voce.nome);
    link.href = '#' + idScheda(voce);
    riga.append(link);
    return riga;
  }));
}

// Il menù si chiude alla scelta, al clic fuori e con Esc, che riporta il fuoco sul bottone.
function preparaMenu(menu = document.getElementById('menu')) {
  menu.addEventListener('click', evento => {
    if (evento.target.closest('.menu-voce')) menu.open = false;
  });
  document.addEventListener('click', evento => {
    if (menu.open && !menu.contains(evento.target)) menu.open = false;
  });
  document.addEventListener('keydown', evento => {
    if (evento.key !== 'Escape' || !menu.open) return;
    menu.open = false;
    menu.querySelector('summary').focus();
  });
}

// La porta: si apre una volta per scheda del browser. Finché è chiusa, quello che c'è dietro non si raggiunge col Tab.
const CHIAVE_PORTA = 'lilith-porta';
const DURATA_PORTA = 1800;
// L'intro: ogni riga si decodifica in 40 passi da 40 ms, la seconda 2 s dopo la prima; poi la porta entra in 1,3 s.
// Un clic la salta. Parte da un tocco, che sblocca anche i suoni.
const PASSO_DECODIFICA = 40;
const PASSI_DECODIFICA = 40;
const PAUSA_RIGHE = 2000;
const DURATA_ENTRATA = 1300;
// I segni della cifra, larghi e stretti: a ogni lettera va un segno non più largo di lei, così la riga non si allunga.
const SEGNI_DECODIFICA = '0123456789ABCDEF#%&*+=/|:;!-';
const TOLLERANZA_SEGNI = 0.02;
const INTRO = new WeakMap();
const LARGHEZZE = new Map();

function portaGiaAperta() {
  try { return sessionStorage.getItem(CHIAVE_PORTA) === 'aperta'; } catch (e) { return false; }
}

// Senza memoria della scheda, come in certe finestre private, la porta torna a ogni apertura: niente di peggio.
function ricordaPorta() {
  try { sessionStorage.setItem(CHIAVE_PORTA, 'aperta'); } catch (e) { /* niente memoria, la porta tornerà */ }
}

function dietroLaPorta(chiusa) {
  document.querySelectorAll('body > :not(.porta)').forEach(el => { el.inert = chiusa; });
  document.documentElement.classList.toggle('porta-chiusa', chiusa);
}

function preparaPorta(porta = document.getElementById('porta')) {
  if (!porta) return;
  if (portaGiaAperta()) {
    porta.remove();
    return;
  }
  dietroLaPorta(true);
  porta.querySelector('.porta-apri').addEventListener('click', () => apriPorta(porta));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) mostraPorta(porta);
  else attendiBussata(porta);
}

// Le larghezze dei segni e delle lettere nel carattere dell'elemento, misurate una volta su una tela.
function larghezze(el) {
  const stile = getComputedStyle(el);
  const carattere = stile.fontStyle + ' ' + stile.fontWeight + ' ' + stile.fontSize + ' ' + stile.fontFamily;
  if (!LARGHEZZE.has(carattere)) {
    const tela = document.createElement('canvas').getContext('2d');
    tela.font = carattere;
    const misure = new Map();
    const misuraDi = c => {
      if (!misure.has(c)) misure.set(c, tela.measureText(c).width);
      return misure.get(c);
    };
    LARGHEZZE.set(carattere, { misuraDi, em: parseFloat(stile.fontSize) || 16 });
  }
  return LARGHEZZE.get(carattere);
}

// Il segno che copre una lettera: a caso fra quelli non più larghi di lei, a meno della tolleranza; se nessuno ci sta,
// il più stretto. Così la riga cifrata non è mai più larga di quella letta, e non va a capo dove quella non va.
function segnoPer(lettera, metro) {
  const limite = metro.misuraDi(lettera) + TOLLERANZA_SEGNI * metro.em;
  const candidati = [...SEGNI_DECODIFICA].filter(segno => metro.misuraDi(segno) <= limite);
  if (candidati.length) return candidati[Math.floor(Math.random() * candidati.length)];
  return [...SEGNI_DECODIFICA].reduce((a, b) => (metro.misuraDi(b) < metro.misuraDi(a) ? b : a));
}

// Una riga si decodifica da sinistra a destra: le lettere non ancora lette cambiano a ogni passo, gli spazi restano,
// e ogni passo fa un tick. Il prefisso è quello che sta già scritto davanti: la prima riga, quando si legge la seconda.
function decodifica(el, testo, fatto, prefisso = '') {
  let passo = 0;
  const metro = larghezze(el);
  const timer = setInterval(() => {
    passo++;
    const lette = Math.floor(testo.length * passo / PASSI_DECODIFICA);
    let riga = testo.slice(0, lette);
    for (let i = lette; i < testo.length; i++) {
      riga += testo[i] === ' ' ? ' ' : segnoPer(testo[i], metro);
    }
    el.textContent = prefisso + riga;
    suoni.suona(tick);
    if (passo >= PASSI_DECODIFICA) {
      clearInterval(timer);
      fatto();
    }
  }, PASSO_DECODIFICA);
  return timer;
}

// Prima dell'intro la porta aspetta un tocco: su nero si decodifica «premi per entrare», e il tocco, un clic o un tasto
// sul bottone, sblocca i suoni e fa partire l'intro. Senza quel gesto i browser non farebbero suonare niente.
function attendiBussata(porta) {
  const bussa = porta.querySelector('.porta-bussa');
  const stato = { timer: null, fine: null, salta: null };
  INTRO.set(porta, stato);
  porta.classList.add('porta-in-attesa');
  stato.timer = decodifica(bussa.querySelector('.porta-bussa-testo'), TESTI.portaBussa, () => {});
  stato.salta = () => {
    porta.removeEventListener('click', stato.salta);
    clearInterval(stato.timer);
    INTRO.delete(porta);
    porta.classList.remove('porta-in-attesa');
    sbloccaSuoni();
    avviaIntro(porta);
  };
  porta.addEventListener('click', stato.salta);
  bussa.focus();
}

// L'intro: su nero, la prima riga che si decodifica, una pausa, la seconda riga sotto di lei, poi la porta che entra,
// col suo suono; un clic la salta.
function avviaIntro(porta) {
  const stato = { salta: () => mostraPorta(porta), timer: null, fine: null };
  INTRO.set(porta, stato);
  porta.classList.add('porta-intro');
  porta.addEventListener('click', stato.salta);
  const el = porta.querySelector('.porta-decodifica');
  const [prima, seconda] = TESTI.portaBenvenuto.split('\n');
  stato.timer = decodifica(el, prima, () => {
    stato.fine = setTimeout(() => {
      stato.timer = decodifica(el, seconda, () => {
        porta.classList.add('porta-entra');
        suoni.suona(entrata);
        stato.fine = setTimeout(() => mostraPorta(porta), DURATA_ENTRATA);
      }, prima + '\n');
    }, PAUSA_RIGHE);
  });
}

// La porta da ferma: tutto in vista, la frase per intero, il fuoco sul bottone. Chiude l'intro, se sta andando.
function mostraPorta(porta) {
  const stato = INTRO.get(porta);
  if (stato) {
    clearInterval(stato.timer);
    clearTimeout(stato.fine);
    porta.removeEventListener('click', stato.salta);
    INTRO.delete(porta);
  }
  porta.classList.remove('porta-in-attesa', 'porta-intro', 'porta-entra');
  porta.classList.add('porta-pronta');
  porta.querySelector('.porta-decodifica').textContent = TESTI.portaBenvenuto;
  porta.querySelector('.porta-apri').focus();
}

// Col movimento ridotto la porta sparisce subito; se no le ante si aprono, e alla fine la porta esce dalla pagina.
function apriPorta(porta = document.getElementById('porta')) {
  if (!porta || porta.classList.contains('porta-in-apertura')) return;
  if (INTRO.has(porta)) mostraPorta(porta);
  ricordaPorta();
  dietroLaPorta(false);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    porta.remove();
    return;
  }
  porta.classList.add('porta-in-apertura');
  suoni.suona(apertura);
  setTimeout(() => porta.remove(), DURATA_PORTA);
}

// I suoni: sintetizzati con Web Audio, senza file. Il contesto nasce al primo gesto dell'utente, perché prima i browser
// non fanno suonare niente; ogni suono è una fabbrica che prende contesto, uscita e istante, così si prova anche fuori
// linea. Si spengono e si accendono dai bottoni «♪», e la scelta resta per la scheda del browser.
const CHIAVE_SUONI = 'lilith-suoni';
const VOLUME_SUONI = 0.35;
const PAUSA_BLIP = 70;
const suoni = {
  contesto: null,
  uscita: null,
  ultimoBlip: 0,
  pronto() { return Boolean(this.contesto) && this.contesto.state === 'running' && suoniAccesi(); },
  suona(fabbrica) {
    if (!this.pronto()) return;
    fabbrica(this.contesto, this.uscita, this.contesto.currentTime);
  }
};

function suoniAccesi() {
  try { return sessionStorage.getItem(CHIAVE_SUONI) !== 'spenti'; } catch (e) { return true; }
}

function impostaSuoni(accesi) {
  try { sessionStorage.setItem(CHIAVE_SUONI, accesi ? 'accesi' : 'spenti'); } catch (e) { /* niente memoria */ }
  const etichetta = accesi ? TESTI.suoniAccesi : TESTI.suoniSpenti;
  document.querySelectorAll('[data-suoni]').forEach(bottone => {
    bottone.setAttribute('aria-pressed', String(accesi));
    bottone.title = etichetta;
    if (bottone.dataset.suoni === 'icona') {
      bottone.setAttribute('aria-label', etichetta);
      bottone.textContent = TESTI.suoniIcona;
    } else {
      bottone.textContent = etichetta;
    }
  });
}

// Al primo gesto: il contesto, se il browser ce l'ha, e la sua uscita col volume di casa.
function sbloccaSuoni() {
  const Contesto = window.AudioContext || window.webkitAudioContext;
  if (!Contesto) return;
  if (!suoni.contesto) {
    suoni.contesto = new Contesto();
    suoni.uscita = suoni.contesto.createGain();
    suoni.uscita.gain.value = VOLUME_SUONI;
    suoni.uscita.connect(suoni.contesto.destination);
  }
  if (suoni.contesto.state === 'suspended') suoni.contesto.resume();
}

function rumore(contesto, durata) {
  const campioni = Math.ceil(contesto.sampleRate * durata);
  const buffer = contesto.createBuffer(1, campioni, contesto.sampleRate);
  const dati = buffer.getChannelData(0);
  for (let i = 0; i < campioni; i++) dati[i] = Math.random() * 2 - 1;
  const sorgente = contesto.createBufferSource();
  sorgente.buffer = buffer;
  return sorgente;
}

function inviluppo(contesto, uscita, t, da, a, durata) {
  const guadagno = contesto.createGain();
  guadagno.gain.setValueAtTime(da, t);
  guadagno.gain.exponentialRampToValueAtTime(a, t + durata);
  guadagno.connect(uscita);
  return guadagno;
}

// Il tick della decodifica: un'onda quadra acuta, a caso fra 1,8 e 3,2 kHz, 30 ms.
function tick(contesto, uscita, t) {
  const onda = contesto.createOscillator();
  onda.type = 'square';
  onda.frequency.value = 1800 + Math.random() * 1400;
  onda.connect(inviluppo(contesto, uscita, t, 0.08, 0.001, 0.03));
  onda.start(t);
  onda.stop(t + 0.03);
}

// Il blip del passaggio del mouse: una sinusoide che sale da 660 a 990 Hz, 60 ms.
function blip(contesto, uscita, t) {
  const onda = contesto.createOscillator();
  onda.type = 'sine';
  onda.frequency.setValueAtTime(660, t);
  onda.frequency.exponentialRampToValueAtTime(990, t + 0.06);
  onda.connect(inviluppo(contesto, uscita, t, 0.06, 0.001, 0.06));
  onda.start(t);
  onda.stop(t + 0.06);
}

// L'entrata della porta: un soffio di rumore filtrato che sale per 0,9 s, poi il colpo delle ante che si chiudono.
function entrata(contesto, uscita, t) {
  const soffio = rumore(contesto, 1);
  const filtro = contesto.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.setValueAtTime(200, t);
  filtro.frequency.exponentialRampToValueAtTime(1600, t + 0.9);
  const guadagno = contesto.createGain();
  guadagno.gain.setValueAtTime(0.001, t);
  guadagno.gain.exponentialRampToValueAtTime(0.3, t + 0.5);
  guadagno.gain.exponentialRampToValueAtTime(0.001, t + 1);
  soffio.connect(filtro).connect(guadagno).connect(uscita);
  soffio.start(t);
  soffio.stop(t + 1);
  const colpo = contesto.createOscillator();
  colpo.type = 'sine';
  colpo.frequency.setValueAtTime(110, t + 0.9);
  colpo.frequency.exponentialRampToValueAtTime(45, t + 1.2);
  colpo.connect(inviluppo(contesto, uscita, t + 0.9, 0.6, 0.001, 0.35));
  colpo.start(t + 0.9);
  colpo.stop(t + 1.3);
  const schiocco = rumore(contesto, 0.05);
  schiocco.connect(inviluppo(contesto, uscita, t + 0.9, 0.25, 0.001, 0.05));
  schiocco.start(t + 0.9);
  schiocco.stop(t + 0.95);
}

// L'apertura: il cricchetto del volante, dieci scatti in 0,6 s, poi il soffio delle ante che scorrono via.
function apertura(contesto, uscita, t) {
  for (let i = 0; i < 10; i++) {
    const scatto = contesto.createOscillator();
    scatto.type = 'square';
    scatto.frequency.value = 380 + i * 25;
    const quando = t + i * 0.06;
    scatto.connect(inviluppo(contesto, uscita, quando, 0.12, 0.001, 0.025));
    scatto.start(quando);
    scatto.stop(quando + 0.025);
  }
  const soffio = rumore(contesto, 1);
  const filtro = contesto.createBiquadFilter();
  filtro.type = 'highpass';
  filtro.frequency.setValueAtTime(300, t + 0.6);
  filtro.frequency.exponentialRampToValueAtTime(2400, t + 1.5);
  const guadagno = contesto.createGain();
  guadagno.gain.setValueAtTime(0.001, t + 0.6);
  guadagno.gain.exponentialRampToValueAtTime(0.25, t + 0.8);
  guadagno.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
  soffio.connect(filtro).connect(guadagno).connect(uscita);
  soffio.start(t + 0.6);
  soffio.stop(t + 1.6);
}

// Il passaggio del mouse, o del fuoco, su un bersaglio: un blip, uno per bersaglio, non più di uno ogni 70 ms.
const BERSAGLI_BLIP = '.scheda, .menu-voce, .menu-apri, .scarica, .feedback, .trailer-copertina, .trailer-apri, .porta-apri, .porta-bussa, .suoni';
let ultimoBersaglio = null;

function passaggio(evento) {
  const bersaglio = evento.target.closest(BERSAGLI_BLIP);
  const nuovo = bersaglio && bersaglio !== ultimoBersaglio;
  ultimoBersaglio = bersaglio;
  if (!nuovo) return;
  const adesso = performance.now();
  if (adesso - suoni.ultimoBlip < PAUSA_BLIP) return;
  suoni.ultimoBlip = adesso;
  suoni.suona(blip);
}

// I bottoni «♪» accendono e spengono; il clic su quello della porta non vale come tocco. Ogni gesto sblocca il contesto.
function preparaSuoni() {
  impostaSuoni(suoniAccesi());
  document.querySelectorAll('[data-suoni]').forEach(bottone => {
    bottone.addEventListener('click', evento => {
      evento.stopPropagation();
      sbloccaSuoni();
      impostaSuoni(!suoniAccesi());
    });
  });
  document.addEventListener('pointerdown', sbloccaSuoni, { capture: true });
  document.addEventListener('keydown', sbloccaSuoni, { capture: true });
  document.addEventListener('mouseover', passaggio);
  document.addEventListener('focusin', passaggio);
}

function scriviTesti() {
  document.querySelectorAll('[data-testo]').forEach(el => {
    el.textContent = TESTI[el.dataset.testo];
  });
}

// Esadecimali finti per i margini: sempre gli stessi, ripetuti due volte perché il nastro torni su sé stesso.
function riempiEsadecimali() {
  let seme = 0x2a17;
  const cifre = () => {
    seme = (Math.imul(seme, 1103515245) + 12345) & 0x7fffffff;
    return ((seme >> 8) & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  };
  document.querySelectorAll('.esadecimali-nastro').forEach(nastro => {
    const righe = [];
    for (let i = 0; i < 90; i++) righe.push(cifre() + ' ' + cifre());
    nastro.textContent = righe.concat(righe).join('\n');
  });
}

// Il contatore di «REC»: con il movimento ridotto non parte.
function avviaContatore() {
  const tempo = document.getElementById('rec-tempo');
  if (!tempo || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const inizio = Date.now();
  setInterval(() => {
    const secondi = Math.floor((Date.now() - inizio) / 1000);
    tempo.textContent = [Math.floor(secondi / 3600), Math.floor(secondi / 60) % 60, secondi % 60]
      .map(n => String(n).padStart(2, '0'))
      .join(':');
  }, 1000);
}

scriviTesti();
riempiEsadecimali();
disegnaSchede(PROGETTI);
disegnaMenu(PROGETTI);
preparaMenu();
preparaPorta();
preparaSuoni();
avviaContatore();
