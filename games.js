const GAMES = [
  // Format: { file: "filename.html", title: "Display Title", tags: ["mobile", "pc"], image: "filename.jpg", featured: true, locked: true, lockReason: "Reason", lockedBy: "Owner/Admin" }
  // Tags: "mobile" = works on mobile, "pc" = works on computer, "both" = works everywhere
  // Image: put the image file in the /images/ folder
  // featured: true = shows in featured row at top, remove or set to false for regular games
  // locked: true = game is locked, shows lock icon, redirects to game-locked page
  // lockReason: Reason shown on game-locked page (only used if locked: true)
  // lockedBy: Who locked it - "Owner" or "Admin" (only used if locked: true)
  
  // UNLOCKED GAMES
  { 
    file: "Obby.html", 
    title: "Very cool obby", 
    tags: ["pc"], 
    image: "De.jpg", 
    featured: false, 
    locked: true,
    lockReason: "Game was made during the beta so its unstable.", 
    lockedBy: "Moderator" 
  },

  { 
    file: "purple.html", 
    title: "Purple", 
    tags: ["pc"], 
    image: "De.jpg", 
    featured: false, 
    locked: true,
    lockReason: "Game was made during the beta so its unstable.", 
    lockedBy: "Moderator" 
  },

  { 
    file: "Cool-game.html", 
    title: "Very cool game", 
    tags: ["pc"], 
    image: "De.jpg", 
    featured: false, 
    locked: true,
    lockReason: "Game was made during the beta so its unstable.", 
    lockedBy: "Moderator" 
  },

  { 
    file: "White-World.html", 
    title: "Metaphor", 
    tags: ["pc"], 
    image: "De.jpg", 
    featured: false, 
    locked: true,
    lockReason: "Game was made during the beta so its unstable.", 
    lockedBy: "Moderator" 
  },

  { 
    file: "Random-game.html", 
    title: "The most random game in the world", 
    tags: ["pc","mobile"], 
    image: "De.jpg", 
    featured: false, 
    locked: true,
    lockReason: "Game was made during the beta so its unstable.", 
    lockedBy: "Moderator" 
  },

  { 
    file: "Beach.html", 
    title: "Beach", 
    tags: ["pc","mobile"], 
    image: "img4.jpg", 
    featured: true, 
    locked: false,
    lockReason: "", 
    lockedBy: "" 
  },

  { 
    file: "metaphor.html", 
    title: "Metaphor", 
    tags: ["pc","mobile"], 
    image: "img5.jpg", 
    featured: false, 
    locked: false,
    lockReason: "", 
    lockedBy: "" 
  },
  

  
  // Add new games below this line
  // Make sure to add matching images to the /images/ folder!
];
