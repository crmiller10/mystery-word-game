/**
 * Mystary Word Game
 */

const express = require("express");
const expressValidator = require("express-validator");
const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");
const session = require("express-session");
const fs = require("fs");
const app = express();
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

app.engine("mustache", mustacheExpress());
app.set("views", "./views");
app.set("view engine", "mustache");

app.use("/", express.static("./public"));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(expressValidator());

/**
 * Game Session
 */
app.use(session({
  secret: '98rncailevn-_DT83FZ@',
  resave: false,
  saveUninitialized: true
}));

function gameValidator(req, res, next) {
  if (game.guessCount == 0 && game.displayArray.indexOf("_") >= 0) {
    game.displayArray = game.computerWord.join(" ");
    game.endMessage = "You lost.";
    res.redirect("/gameover");
  } else if (game.guessCount >= 1 && game.displayArray.indexOf("_") < 0) {
    game.displayArray = game.computerWord.join(" ");
    game.endMessage = "You won!";
    res.redirect("/gameover");
  } else {
    next(); // Go on to play game
  }
}

function wordGenerator() {
  return words[Math.floor(Math.random() * words.length)].toUpperCase().split("");
}

/**
 * Game
 */
let game = {};
let computerWord;

function gameGenerator() {
  computerWord = wordGenerator();

  let displayArray = (function() {
    let placeholderArray = [];
    let arrayLength = computerWord.length;
    for (let i = 0; i < arrayLength; i++) {
      placeholderArray.push("_");
    }
    return placeholderArray;
  })();

  // Game Variables
  game = {
    computerWord: computerWord,
    lettersGuessed: [],
    guessCount: 8,
    userDisplayGuessed: " ",
    displayArray: displayArray,
    userDisplayString: displayArray.join(" "),
    message: "Enter guess below",
    endMessage: ""
  };
}

function gameRestart() {
  game.guessCount = 8;
  game.computerWord = computerWord;
  game.lettersGuessed = [];
  game.userDisplayGuessed = " ";
  game.message = "Enter guess below";
  game.endMessage = "";
}

/**
 * Routes
 */
app.get("/", function(req, res) {
  res.redirect("/game");
  gameGenerator();
});

app.get("/game", gameValidator, function(req, res) {
  res.render("game", {
    game: game
  });
});

app.post("/guess", function(req, res) {
  let userGuess = req.body.guess.toUpperCase();
  game.message = " ";

  function alreadyGuessed() {
    if (game.lettersGuessed.indexOf(userGuess) > -1) {
      return true;
    } else {
      return false;
    }
  }

  if (userGuess.length == 0) {
    game.message = "Please Enter A Character.";
    res.redirect("/game");
  } else if (alreadyGuessed() == true) {
    game.message = "Letter Already Guessed...Try Again";
    res.redirect("/game");
  } else if (computerWord.indexOf(userGuess) < 0) {
    game.guessCount -= 1;
    game.lettersGuessed.push(userGuess);
    game.message = "Incorrect!";
    res.redirect("/game");
  } else {
    computerWord.forEach(function(letter, index) {
      if (userGuess === letter) {
        game.displayArray[index] = computerWord[index];
      }
    });
    game.lettersGuessed.push(userGuess);
    game.message = "Correct!";
  }

  game.userDisplayString = game.displayArray.join(" ");
  game.userDisplayGuessed = game.lettersGuessed.join(" ");
  res.redirect("/game");
});

app.get("/gameover", function(req, res) {
  res.render("gameover", {
    game: game
  });
});

app.get("/gamerestart", function(req, res) {
  wordGenerator();
  gameGenerator();
  gameRestart();
  res.redirect("/game");
});


app.listen(3000, function() {
  console.log('App server on port 3000...');
});