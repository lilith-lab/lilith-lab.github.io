// Testi dell'interfaccia: per un'altra lingua si cambia questo oggetto e basta.
const TESTI = {
  marchio: 'lilith lab',
  sottotitolo: 'progetti da provare',
  fasciaTitolo: 'ALPHA · LAVORI IN CORSO',
  fasciaTesto: 'Questi progetti sono ancora in costruzione: provali come sono, e dimmi cosa funziona e cosa no.',
  presentazione: 'Per ogni progetto trovi il trailer, le istruzioni e il pacchetto da scaricare. Trailer e download si aprono con l\'account Google con cui hai ricevuto l\'invito.',
  etichetta: 'alpha · ',
  consegna: 'consegna del ',
  sistemi: 'Sistemi',
  istruzioni: 'Come si usa',
  scarica: 'Scarica',
  scaricaSpento: 'Scarica · in arrivo',
  trailerSpento: 'trailer in arrivo',
  trailerApri: 'Apri il trailer su Drive',
  trailerTitolo: 'Trailer di ',
  piede: 'lilith lab',
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

function disegnaTrailer(voce) {
  const parte = crea('div', 'trailer');
  parte.dataset.parte = 'trailer';
  if (!voce.trailer) {
    parte.append(crea('div', 'trailer-riquadro trailer-spento', TESTI.trailerSpento));
    return parte;
  }
  const drive = MODELLO_DRIVE.exec(voce.trailer);
  if (drive) {
    const cornice = crea('iframe', 'trailer-riquadro');
    cornice.src = 'https://drive.google.com/file/d/' + drive[1] + '/preview';
    cornice.title = TESTI.trailerTitolo + voce.nome;
    cornice.setAttribute('loading', 'lazy');
    cornice.setAttribute('allowfullscreen', '');
    parte.append(cornice);
  }
  parte.append(linkEsterno(voce.trailer, TESTI.trailerApri, 'trailer-apri'));
  return parte;
}

function disegnaScarica(voce) {
  let bottone;
  if (!voce.scarica) {
    bottone = crea('span', 'scarica scarica-spento', TESTI.scaricaSpento);
    bottone.setAttribute('aria-disabled', 'true');
  } else {
    bottone = linkEsterno(voce.scarica, TESTI.scarica, 'scarica');
  }
  bottone.dataset.parte = 'scarica';
  return bottone;
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

  scheda.append(
    versione,
    nome,
    frase,
    disegnaTrailer(voce),
    disegnaElenco('ul', 'sistemi', TESTI.sistemi, voce.sistemi, 'sistemi'),
    disegnaElenco('ol', 'passi', TESTI.istruzioni, voce.istruzioni, 'istruzioni'),
    disegnaScarica(voce)
  );
  return scheda;
}

// Svuota il contenitore e ridisegna una scheda per voce.
function disegnaSchede(elenco, contenitore = document.getElementById('schede')) {
  contenitore.replaceChildren(...elenco.map(disegnaScheda));
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

// Un trailer che prende il fuoco ferma quello di prima. I riquadri di Drive non dicono alla pagina quando un video
// parte: la pagina vede solo dove sta il fuoco, e rifà da capo il riquadro lasciato.
let trailerDiPrima = null;

function ricarica(cornice) {
  cornice.replaceWith(cornice.cloneNode());
}

function trailerAttivo(el) {
  if (!el || !el.matches('iframe.trailer-riquadro') || el === trailerDiPrima) return;
  if (trailerDiPrima) ricarica(trailerDiPrima);
  trailerDiPrima = el;
}

// Il fuoco che passa da un riquadro all'altro non manda eventi alla pagina: si guarda ogni 300 ms.
function sorvegliaTrailer() {
  setInterval(() => trailerAttivo(document.activeElement), 300);
}

scriviTesti();
riempiEsadecimali();
disegnaSchede(PROGETTI);
avviaContatore();
sorvegliaTrailer();
