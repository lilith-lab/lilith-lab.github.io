// Testi dell'interfaccia: per un'altra lingua si cambia questo oggetto e basta.
const TESTI = {
  marchio: 'lilith lab',
  sottotitolo: 'progetti da provare',
  barraMarchio: 'lilith lab',
  menuApri: 'Progetti',
  fasciaTitolo: 'ALPHA · LAVORI IN CORSO',
  fasciaTesto: 'Versioni in sviluppo, da provare così come sono: ogni segnalazione aiuta a migliorarle.',
  presentazione: 'Per ogni progetto trovi il trailer, i primi passi e il pacchetto da scaricare. Trailer e download si aprono con l\'account Google a cui è arrivato l\'invito; i feedback vanno nella tua cartella, col link nell\'email d\'invito.',
  etichetta: 'alpha · ',
  consegna: 'consegna del ',
  sistemi: 'Sistemi',
  istruzioni: 'Come si usa',
  scarica: 'Scarica',
  scaricaSpento: 'Scarica · in arrivo',
  feedback: 'Feedback · nella tua cartella: il link è nell\'email d\'invito',
  trailerSpento: 'trailer in arrivo',
  trailerApri: 'Apri il trailer su Drive',
  trailerTitolo: 'Trailer di ',
  trailerAvvia: '▶ avvia il trailer',
  criptatoTitolo: '▓▓▓ ACCESSO NEGATO ▓▓▓',
  criptatoSotto: 'materiale criptato',
  criptatoTesto: 'Mi spiace, non hai accesso a questo materiale.',
  criptatoInvito: '› Hai l\'invito? Clicca ed entra con quell\'account Google.',
  portaSigla: '▓▓ ACCESSO RISERVATO ▓▓',
  // Il benvenuto in due righe, con l'a capo nel testo: nell'intro la seconda arriva dopo la prima, e finisce col nome
  // scritto da chi entra, o con «l'eletto» se non ne scrive nessuno.
  portaBenvenuto: 'benvenuto straniero.\no dovrei chiamarti: ',
  portaEletto: 'l\'eletto',
  portaNomeEtichetta: 'Il tuo nome',
  portaNomeAiuto: 'scrivi il tuo nome e premi invio',
  portaBentornato: 'bentornato ',
  portaRewind: '◂◂ rewind',
  portaRewindTitolo: 'Dimentica il nome e ricomincia dall\'inizio',
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

// In una cornice stretta Drive non mette il lettore intero: sugli schermi a tocco quello da telefono, che esce dai
// bordi e perde i controlli, col mouse una banda nera in cima e il video spostato sotto. La cornice di Drive si disegna
// larga e si rimpicciolisce fino al riquadro: 1280 px sugli schermi a tocco, 854 col mouse, e Drive ci mette il lettore
// intero, coi controlli al loro posto.
const LARGHEZZA_DRIVE_TOCCO = 1280;
const LARGHEZZA_DRIVE_MOUSE = 854;
const SCHERMO_A_TOCCO = '(pointer: coarse)';

function apriTrailer(copertina) {
  chiudiTrailer();
  const cornice = crea('iframe');
  cornice.src = 'https://drive.google.com/file/d/' + copertina.dataset.id + '/preview';
  cornice.title = copertina.title;
  cornice.setAttribute('allowfullscreen', '');
  const riquadro = crea('div', 'trailer-riquadro trailer-ridotto');
  riquadro.dataset.larghezza = matchMedia(SCHERMO_A_TOCCO).matches ? LARGHEZZA_DRIVE_TOCCO : LARGHEZZA_DRIVE_MOUSE;
  riquadro.append(cornice);
  copertina.replaceWith(riquadro);
  trailerAperto = { riquadro, copertina, osservatore: null };
  adattaTrailer(riquadro);
  // Il riquadro cambia larghezza quando il telefono si gira o la finestra si stringe: la scala lo segue.
  if (window.ResizeObserver) {
    trailerAperto.osservatore = new ResizeObserver(() => adattaTrailer(riquadro));
    trailerAperto.osservatore.observe(riquadro);
  }
}

// La cornice larga quanto dice il riquadro, alta in sedici noni, rimpicciolita fino alla larghezza del riquadro.
function adattaTrailer(riquadro) {
  const larghezza = Number(riquadro.dataset.larghezza);
  const cornice = riquadro.querySelector('iframe');
  cornice.style.width = larghezza + 'px';
  cornice.style.height = Math.round(larghezza * 9 / 16) + 'px';
  cornice.style.transform = 'scale(' + riquadro.clientWidth / larghezza + ')';
}

function chiudiTrailer() {
  if (trailerAperto) {
    if (trailerAperto.osservatore) trailerAperto.osservatore.disconnect();
    trailerAperto.riquadro.replaceWith(trailerAperto.copertina);
  }
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

// Il feedback non ha un link nella pagina: ogni invitato ha la sua cartella di Drive, col link nell'email d'invito.
function disegnaFeedback() {
  const nota = crea('p', 'feedback', TESTI.feedback);
  nota.dataset.parte = 'feedback';
  return nota;
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
  azioni.append(disegnaScarica(voce), disegnaFeedback());

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
// Il nome di chi entra resta nel suo browser e non va da nessun'altra parte: alla visita dopo, la porta lo saluta.
const CHIAVE_NOME = 'lilith-nome';
const LUNGHEZZA_NOME = 24;
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
const FRASI = new WeakMap();
const LARGHEZZE = new Map();

function portaGiaAperta() {
  try { return sessionStorage.getItem(CHIAVE_PORTA) === 'aperta'; } catch (e) { return false; }
}

// Senza memoria della scheda, come in certe finestre private, la porta torna a ogni apertura: niente di peggio.
function ricordaPorta() {
  try { sessionStorage.setItem(CHIAVE_PORTA, 'aperta'); } catch (e) { /* niente memoria, la porta tornerà */ }
}

function leggiNome() {
  try { return pulisciNome(localStorage.getItem(CHIAVE_NOME) || ''); } catch (e) { return ''; }
}

// Senza memoria del browser il nome non resta: alla visita dopo la porta lo chiede di nuovo, niente di peggio.
function salvaNome(nome) {
  try { localStorage.setItem(CHIAVE_NOME, nome); } catch (e) { /* niente memoria */ }
}

function dimenticaNome() {
  try { localStorage.removeItem(CHIAVE_NOME); } catch (e) { /* niente memoria */ }
}

// Il nome come si mostra: senza caratteri di controllo, con gli spazi ridotti a uno, al massimo LUNGHEZZA_NOME segni.
function pulisciNome(testo) {
  const pulito = String(testo).replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim();
  return [...pulito].slice(0, LUNGHEZZA_NOME).join('').trim();
}

// La frase del benvenuto finita: col nome, o con «l'eletto» quando il nome non c'è.
function fraseBenvenuto(nome) {
  return TESTI.portaBenvenuto + (nome || TESTI.portaEletto);
}

// La frase che la porta dice quando è pronta, anche a chi legge con uno screen reader.
function scriviFrase(porta, frase) {
  FRASI.set(porta, frase);
  porta.querySelector('.porta-lettori').textContent = frase;
}

function fraseDi(porta) {
  return FRASI.get(porta) || fraseBenvenuto('');
}

function dietroLaPorta(chiusa) {
  document.querySelectorAll('body > :not(.porta)').forEach(el => { el.inert = chiusa; });
  document.documentElement.classList.toggle('porta-chiusa', chiusa);
}

// Senza nome la porta aspetta il tocco e fa l'intro, che finisce chiedendolo; col movimento ridotto lo chiede subito.
// Con un nome già scritto, in una scheda nuova, saluta.
function preparaPorta(porta = document.getElementById('porta')) {
  if (!porta) return;
  if (portaGiaAperta()) {
    porta.remove();
    return;
  }
  dietroLaPorta(true);
  preparaComandiPorta(porta);
  scriviFrase(porta, fraseBenvenuto(''));
  const nome = leggiNome();
  if (nome) salutaDiNuovo(porta, nome);
  else if (matchMedia('(prefers-reduced-motion: reduce)').matches) chiediNome(porta);
  else attendiBussata(porta);
}

// I comandi della porta: il bottone che la apre, il campo del nome, con un tick a ogni tasto, e il rewind.
function preparaComandiPorta(porta) {
  const campo = porta.querySelector('.porta-nome-campo');
  porta.querySelector('.porta-apri').addEventListener('click', () => apriPorta(porta));
  porta.querySelector('.porta-nome').addEventListener('submit', evento => {
    evento.preventDefault();
    rispondi(porta, campo.value);
  });
  campo.addEventListener('input', () => suoni.suona(tick));
  const rewind = porta.querySelector('.porta-rewind');
  rewind.title = TESTI.portaRewindTitolo;
  rewind.addEventListener('click', evento => {
    evento.stopPropagation();
    riavvolgi(porta);
  });
}

// Ferma l'intro in corso, se c'è: i tempi e il clic che la salta.
function fermaIntro(porta) {
  const stato = INTRO.get(porta);
  if (!stato) return;
  clearInterval(stato.timer);
  clearTimeout(stato.fine);
  if (stato.salta) porta.removeEventListener('click', stato.salta);
  INTRO.delete(porta);
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
// Si conta per segni, non per unità del testo, perché un nome con un'emoji non si spezzi a metà.
function decodifica(el, testo, fatto, prefisso = '') {
  let passo = 0;
  const metro = larghezze(el);
  const lettere = [...testo];
  const timer = setInterval(() => {
    passo++;
    const lette = Math.floor(lettere.length * passo / PASSI_DECODIFICA);
    let riga = lettere.slice(0, lette).join('');
    for (let i = lette; i < lettere.length; i++) {
      riga += lettere[i] === ' ' ? ' ' : segnoPer(lettere[i], metro);
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

// L'intro: su nero, la prima riga che si decodifica, una pausa, la seconda riga sotto di lei fino ai due punti, poi il
// campo del nome; un clic la salta fino al campo.
function avviaIntro(porta) {
  const stato = { salta: () => chiediNome(porta), timer: null, fine: null };
  INTRO.set(porta, stato);
  porta.classList.add('porta-intro');
  porta.addEventListener('click', stato.salta);
  const el = porta.querySelector('.porta-decodifica');
  const [prima, seconda] = TESTI.portaBenvenuto.split('\n');
  stato.timer = decodifica(el, prima, () => {
    stato.fine = setTimeout(() => {
      stato.timer = decodifica(el, seconda, () => chiediNome(porta), prima + '\n');
    }, PAUSA_RIGHE);
  });
}

// Il nome si chiede in un campo stile terminale, sotto la domanda: un clic sulla porta porta il fuoco nel campo, Invio
// risponde.
function chiediNome(porta) {
  fermaIntro(porta);
  porta.classList.remove('porta-in-attesa', 'porta-intro', 'porta-pronta', 'porta-bentornato');
  porta.classList.add('porta-chiede');
  porta.querySelector('.porta-decodifica').textContent = TESTI.portaBenvenuto;
  porta.querySelector('.porta-lettori').textContent = TESTI.portaBenvenuto;
  const campo = porta.querySelector('.porta-nome-campo');
  const stato = { salta: () => campo.focus(), timer: null, fine: null };
  INTRO.set(porta, stato);
  porta.addEventListener('click', stato.salta);
  campo.value = '';
  campo.focus();
}

// La risposta: il nome pulito si ricorda, se c'è, e si decodifica dopo i due punti; senza nome, «l'eletto», e non si
// ricorda niente. Poi entrano le ante, col loro suono; un clic salta alla porta pronta.
function rispondi(porta, testo) {
  if (!porta.classList.contains('porta-chiede')) return;
  fermaIntro(porta);
  const nome = pulisciNome(testo);
  if (nome) salvaNome(nome);
  scriviFrase(porta, fraseBenvenuto(nome));
  porta.classList.remove('porta-chiede');
  porta.querySelector('.porta-nome-campo').blur();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    mostraPorta(porta);
    return;
  }
  const stato = { salta: () => mostraPorta(porta), timer: null, fine: null };
  INTRO.set(porta, stato);
  porta.classList.add('porta-intro');
  porta.addEventListener('click', stato.salta);
  const el = porta.querySelector('.porta-decodifica');
  stato.timer = decodifica(el, nome || TESTI.portaEletto, () => {
    porta.classList.add('porta-entra');
    suoni.suona(entrata);
    stato.fine = setTimeout(() => mostraPorta(porta), DURATA_ENTRATA);
  }, TESTI.portaBenvenuto);
}

// La porta da ferma: tutto in vista, la sua frase per intero, il fuoco sul bottone. Chiude l'intro, se sta andando.
function mostraPorta(porta) {
  fermaIntro(porta);
  porta.classList.remove('porta-in-attesa', 'porta-intro', 'porta-entra', 'porta-chiede');
  porta.classList.add('porta-pronta');
  porta.querySelector('.porta-decodifica').textContent = fraseDi(porta);
  porta.querySelector('.porta-apri').focus();
}

// Alla visita dopo, in una scheda nuova: niente tocco, intro né campo, la porta pronta che saluta per nome, col rewind.
// La frase si decodifica una volta, muta, perché prima di un gesto i suoni non partono.
function salutaDiNuovo(porta, nome) {
  scriviFrase(porta, TESTI.portaBentornato + nome + '.');
  porta.classList.add('porta-bentornato');
  mostraPorta(porta);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const stato = { salta: null, timer: null, fine: null };
  INTRO.set(porta, stato);
  stato.timer = decodifica(porta.querySelector('.porta-decodifica'), fraseDi(porta), () => INTRO.delete(porta));
}

// Il rewind: il nome si dimentica e la porta ricomincia dall'intro, col nastro che torna indietro. Il clic sul rewind è
// già un gesto, quindi il tocco non serve: i suoni sono sbloccati.
function riavvolgi(porta) {
  fermaIntro(porta);
  dimenticaNome();
  sbloccaSuoni();
  suoni.suonaAppena(riavvolgimento);
  porta.classList.remove('porta-pronta', 'porta-bentornato');
  scriviFrase(porta, fraseBenvenuto(''));
  porta.querySelector('.porta-decodifica').textContent = '';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) chiediNome(porta);
  else avviaIntro(porta);
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
  suoni.suonaAppena(apertura);
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
  },
  // Il primo gesto può trovare il contesto appena nato e ancora sospeso, come davanti alla porta del bentornato: allora
  // il suono aspetta che riprenda, e parte se nel frattempo i suoni non sono stati spenti.
  suonaAppena(fabbrica) {
    if (this.contesto && this.contesto.state === 'suspended' && suoniAccesi()) {
      this.contesto.resume().then(() => {
        if (this.pronto()) fabbrica(this.contesto, this.uscita, this.contesto.currentTime);
      }, () => {});
      return;
    }
    this.suona(fabbrica);
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

// Il rewind: un'onda a dente di sega che scende da 1400 a 180 Hz in 0,45 s, il nastro che torna indietro.
function riavvolgimento(contesto, uscita, t) {
  const onda = contesto.createOscillator();
  onda.type = 'sawtooth';
  onda.frequency.setValueAtTime(1400, t);
  onda.frequency.exponentialRampToValueAtTime(180, t + 0.45);
  onda.connect(inviluppo(contesto, uscita, t, 0.07, 0.001, 0.45));
  onda.start(t);
  onda.stop(t + 0.45);
}

// Il passaggio del mouse, o del fuoco, su un bersaglio: un blip, uno per bersaglio, non più di uno ogni 70 ms.
const BERSAGLI_BLIP = '.scheda, .menu-voce, .menu-apri, .scarica, .trailer-copertina, .trailer-apri, .porta-apri, .porta-bussa, .porta-rewind, .suoni';
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
