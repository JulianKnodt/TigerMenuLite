#!/usr/bin/env node

const request = require('request');
//const phantom = require('phantom');
const xmlParser = require('xml2js');
const c = require('colors');

const width = 75;

const diningHalls = {
WuCox: 2,
       Forbes: 3,
       "Graduate College": 4,
       RoMa: 1,
       Whitman: 8,
       CJL: 5,
};

const last = arr => arr[arr.length - 1];

// Takes an array of strings and makes a new array of array of strings each row being of
// approx equal amt of characters.
const sumLength = arr => arr.reduce((s, n) => s + n.length, 0);

const bunchUp = (strs, maxLength) => strs.reduce((acc, next) => {
  if (sumLength(last(acc)) + next.length >= maxLength) {
    return acc.concat([[next]]);
  } else {
    last(acc).push(next);
    return acc;
  }  
}, [[]]);



const pad = (string, totalSize, padChar) => {
  if(string.length > totalSize) return string;
  const padSize = (totalSize - string.length)/2;
  if (Math.floor(padSize) === padSize) {
    return padChar[0].repeat(padSize) + string + padChar[0].repeat(padSize);
  } else {
    return padChar[0].repeat(padSize) + string + padChar[0].repeat(padSize+1);
  }
}

const sep = `|${'-'.repeat(width)}|
`
const edge = `+${'-'.repeat(width)}+
`

const createMenuString = (label, menu) => {
  if(!menu) {
    return edge + c.red(`|${pad(`No idea what's for ${label} :P`, width, ' ')}|`) + '\n' + edge;
  }
  return pad(label.white, width+2 + ''.white.length, '_') + '\n' +
    bunchUp(menu.entree.map(it => it.name[0]), width - 6)
    .map(it => it.join(' | '))
    .map(it => `|${pad(it, width, ' ')}|` + '\n')
    .join('') + edge;
}

const getDiningHallString = (i, name, breakfast, lunch, dinner) => {
  return `${pad(name.red, 2+width+''.red.length, ' ')}` + '\n';
};

const leftpad = (str, size) => (str.length > size ? str : '0'.repeat(size - str.length) + str)

const getMenu = (n, name, cb) => {
  const date = (new Date).toLocaleDateString();

  const uri = `http://diningmenu.princeton.edu/getmenu2.php?location=${leftpad(n.toString(), 2)}&date=${date}`;
  request(uri, (error, resp, body) => {
      xmlParser.parseString(body, (err, res) => {
          if (err) return console.error(err);
          cb(n, name, res);
          });
      });
}

const beforeBreakfast = (_date = new Date()) => {
  return _date.getHours() >= 21 || _date.getHours() < 10;
};

const beforeLunch = (_date = new Date()) => {
  return _date.getHours() >= 10 && _date.getHours() < 15;
};

const beforeDinner = (_date = new Date()) => {
  return _date.getHours () >= 15 && _date.getHours() < 21;
};


const printMenu = (n, name, {menu}) => {
  let bf, lunch, dinner;
  if (!menu.meal) return;
  for (let elem of menu.meal) {
    const { name } = elem['$'];
    if (name === 'Lunch') lunch = elem;
    else if (name === 'Breakfast') bf = elem;
    else if (name === 'Dinner') dinner = elem;
  }
  const starter = getDiningHallString(n, name, bf, lunch, dinner); 
  if (beforeBreakfast() && bf) console.log(starter + createMenuString('Breakfast', bf));
  else if (beforeLunch() && lunch) console.log(starter + createMenuString('Lunch', lunch));
  else if (beforeDinner() && dinner) console.log(starter + createMenuString('Dinner', dinner));
  else console.log(starter + createMenuString('Dinner', dinner));

}

const clear = () => {
  process.stdout.write('\033c');
}

const printAllMenus = async () => {
  clear();
  const date = (new Date).toLocaleDateString();
  console.log("Today is " + date);
  for (let key in diningHalls) {
    getMenu(diningHalls[key], key, printMenu);
  }
}

const loopMenu = () => {
  printAllMenus();
  setInterval(printAllMenus, 3.6 * Math.pow(10, 6));
}


loopMenu();

