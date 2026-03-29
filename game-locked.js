// game-lock.js - FINAL ATTEMPT
if (window.location.pathname.includes('/games/')) {
  let gameFile = window.location.pathname.split('/').pop();
  
  let check = setInterval(function() {
    if (window.GAMES) {
      clearInterval(check);
      let game = window.GAMES.find(g => g.file === gameFile);
      if (game && game.locked) {
        window.location.href = '/locked.html';
      }
    }
  }, 100);
}