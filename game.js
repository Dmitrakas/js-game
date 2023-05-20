const crypto = require('crypto');

class KeyGenerator {
  static generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }
}

class HMACCalculator {
  static calculateHMAC(key, move) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(move);
    return hmac.digest('hex');
  }
}

class MoveRules {
  static getWinner(userMoveIndex, computerMoveIndex, moves) {
    const n = moves.length;
    const half = Math.floor(n / 2);

    if (userMoveIndex === computerMoveIndex) {
      return 0;
    } else if (
      userMoveIndex - computerMoveIndex < 0 && Math.abs(userMoveIndex - computerMoveIndex) <= half ||
      userMoveIndex - computerMoveIndex > 0 && userMoveIndex - computerMoveIndex > half
    ) {
      return -1;
    } else {
      return 1;
    }
  }
}

class Game {
  constructor(moves) {
    this.moves = moves;
    this.key = KeyGenerator.generateKey();
  }

  displayMoves() {
    console.log('Available moves:');
    this.moves.forEach((move, index) => {
      console.log(`${index + 1} - ${move}`);
    });
    console.log('0 - exit');
    console.log('? - help');
  }

  startGame() {
    const hmac = HMACCalculator.calculateHMAC(this.key, '');
    console.log('HMAC:', hmac);

    const computerMoveIndex = Math.floor(Math.random() * this.moves.length);
    const computerMoveName = this.moves[computerMoveIndex];
    
    this.displayMoves();

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askUserMove = () => {
      rl.question('Enter your move: ', (userMove) => {
        if (userMove === '?') {
          this.displayHelp();
          rl.close();
          return;
        }
    
        if (userMove === '0') {
          console.log('Exiting the game.');
          rl.close();
          return;
        }
    
        const userMoveIndex = parseInt(userMove);
        if (isNaN(userMoveIndex) || userMoveIndex < 1 || userMoveIndex > this.moves.length) {
          console.log('Invalid move. Please try again.');
          this.displayMoves();
          return;
        }

        const userMoveName = this.moves[userMoveIndex - 1];
        console.log('Your move:', userMoveName);
        console.log('Computer move:', computerMoveName);

        const result = MoveRules.getWinner(userMoveIndex - 1, computerMoveIndex, moves);
        if (result === 0) {
          console.log('It\'s a draw!');
        } else if (result === 1) {
          console.log('You win!');
        } else {
          console.log('Computer wins!');
        }

        console.log(`HMAC key: ${this.key}`);

        rl.close();
      });
    };

    askUserMove();
  }

  displayHelp() {
    const table = this.generateHelpTable();
    console.log(table);
  }

  generateHelpTable() {
    const n = this.moves.length;
    const table = [];

    const headerRow = ['Moves', ...this.moves];
    table.push(headerRow);

    for (let i = 0; i < n; i++) {
      const row = [this.moves[i]];
      for (let j = 0; j < n; j++) {
        const result = MoveRules.getWinner(i, j, this.moves);
        let cellValue;
        if (result === 0) {
          cellValue = 'Draw';
        } else if (result === 1) {
          cellValue = 'Win';
        } else {
          cellValue = 'Lose';
        }
        row.push(cellValue);
      }
      table.push(row);
    }

    const maxLengths = new Array(n + 1).fill(0);
    for (const row of table) {
      for (let i = 0; i < row.length; i++) {
        if (row[i].length > maxLengths[i]) {
          maxLengths[i] = row[i].length;
        }
      }
    }

    let formattedTable = '';
    for (const row of table) {
      for (let i = 0; i < row.length; i++) {
        const cell = row[i].padEnd(maxLengths[i]);
        formattedTable += cell + ' ';
      }
      formattedTable += '\n';
    }

    return formattedTable;
  }
}

const moves = process.argv.slice(2);
if (moves.length < 3 || moves.length % 2 === 0 || new Set(moves).size !== moves.length) {
  console.log('Incorrect arguments. Please provide an odd number of non-repeating moves.');
  console.log('Example: node game.js rock paper scissors');
  process.exit(1);
}

const game = new Game(moves);
game.startGame();
