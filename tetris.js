// Initialize a 2D array with dimensions 52x7
const contributionArray = Array.from({ length: 7 }, () => Array(52).fill(null));

// Select all contribution tiles on the page
const contributionTiles = document.querySelectorAll('td.ContributionCalendar-day');

// Map each tile to its position in the array and set data-level to 0
contributionTiles.forEach(tile => {
  const dataIx = parseInt(tile.getAttribute('data-ix')) - 1; // Width (subtract 1 for zero indexing)
  const row = tile.closest('tr'); // Get the closest <tr> ancestor
  const height = Array.from(row.parentNode.children).indexOf(row); // Row index determines height
  contributionArray[height][dataIx] = tile; // Store the tile in the 2D array
  tile.setAttribute('data-level', '0'); // Set the initial data-level to 0
});

// Tetromino shapes (rotated to fall sideways)
// This doubles as a frequency map, S and Z are twice as rare
const tetrominoes = [
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }], // I-shape
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }], // O-shape
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], // L-shape
  [{ x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], // J-shape
  [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], // T-shape
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }], // I-shape
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }], // O-shape
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], // L-shape
  [{ x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], // J-shape
  [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], // T-shape
  [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }], // Z-shape
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }], // S-shape
];

// Array to hold indices of tetrominoes for fair distribution
let tetrominoBag = [];
// Active tetromino state
let activeTetromino = [];
let position = { x: 46, y: 3 }; // Start from the right center
let gameOver = false;


// Function to shuffle an array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

// Function to get the next tetromino
const getNextTetromino = () => {
  // If the bag is empty, refill and shuffle it
  if (tetrominoBag.length === 0) {
    tetrominoBag = [...Array(tetrominoes.length).keys()]; // Fill with indices
    shuffleArray(tetrominoBag); // Shuffle the bag
  }

  // Return the next tetromino index and remove it from the bag
  return tetrominoBag.pop();
};


const spawnTetromino = () => {
  const randomIndex = getNextTetromino(); // Use fair distribution
  activeTetromino = tetrominoes[randomIndex].map(block => ({
    x: position.x + block.x,
    y: position.y + block.y,
  }));

  // Check if any part of the tetromino can fit in the spawn position
  const validSpawn = activeTetromino.some(block => {
    const tile = contributionArray[block.y]?.[block.x];
    return tile && tile.getAttribute('data-level') === '0';
  });

  if (!validSpawn) {
    gameOver = true; // Game over condition
    alert("Game Over!");
    return;
  }

  renderTetromino();
};

// Function to check if the tetromino can move
const canMove = () => {
  return activeTetromino.every(block => {
    const nextX = block.x - 1; // Moving left
    const nextTile = contributionArray[block.y]?.[nextX];
    
    // Check if the next tile is within bounds and is either empty or part of the current tetromino
    return (
      nextTile &&
      (nextTile.getAttribute('data-level') === '0' || 
       activeTetromino.some(b => b.x === nextX && b.y === block.y)) // Allow movement over itself
    );
  });
};

// Function to render the tetromino on the grid
const renderTetromino = () => {
  activeTetromino.forEach(block => {
    const tile = contributionArray[block.y]?.[block.x];
    if (tile) {
      tile.setAttribute('data-level', '4'); // Set the tile to active
    }
  });
};

// Function to clear the tetromino's previous position
const clearTetromino = () => {
  activeTetromino.forEach(block => {
    const tile = contributionArray[block.y]?.[block.x];
    if (tile) {
      tile.setAttribute('data-level', '0'); // Clear the tile
    }
  });
};

// Function to check and clear full columns, then move the stack left
const clearFullColumns = () => {
  for (let x = 0; x < 52; x++) {
    // Check if the column is full (all cells in the column are filled)
    const isFullColumn = contributionArray.every(row => row[x] && row[x].getAttribute('data-level') !== '0');
    
    if (isFullColumn) {
      // Clear the full column
      contributionArray.forEach(row => {
        const tile = row[x];
        if (tile) {
          tile.setAttribute('data-level', '0');
        }
      });
      
      // Shift all columns to the left starting from the cleared column
      shiftColumnsLeft(x);
    }
  }
};

// Function to shift all columns leftwards after a column is cleared
const shiftColumnsLeft = (clearedColumnIndex) => {
  // Loop through each column starting from the cleared column
  for (let x = clearedColumnIndex; x < 51; x++) {
    for (let y = 0; y < 7; y++) {
      const currentTile = contributionArray[y]?.[x + 1];
      const nextTile = contributionArray[y]?.[x];

      if (currentTile) {
        nextTile.setAttribute('data-level', currentTile.getAttribute('data-level'));
      } else {
        nextTile.setAttribute('data-level', '0');
      }
    }
  }
};

// Function to move the tetromino left (falling sideways)
const moveTetromino = () => {
  if (gameOver) return;

  if (canMove()) {
    clearTetromino();
    activeTetromino = activeTetromino.map(block => ({
      x: block.x - 1,
      y: block.y,
    }));
    renderTetromino();
  } else {
    // Land the tetromino
    activeTetromino.forEach(block => {
      const tile = contributionArray[block.y]?.[block.x];
      if (tile) {
        tile.setAttribute('data-level', '2'); // Mark as landed
      }
    });

    // After landing, check and clear full columns and shift left
    clearFullColumns();
    clearFullColumns();
    clearFullColumns();
    clearFullColumns();

    // Spawn a new tetromino
    position = { x: 51, y: 3 }; // Reset position
    spawnTetromino();
  }
};

// Function to instantly drop the tetromino left
const dropTetrominoLeft = () => {
  if (gameOver) return;

  while (canMove()) {
    clearTetromino();
    activeTetromino = activeTetromino.map(block => ({
      x: block.x - 1,
      y: block.y,
    }));
    renderTetromino();
  }

  // After moving left as far as possible, land the tetromino
  activeTetromino.forEach(block => {
    const tile = contributionArray[block.y]?.[block.x];
    if (tile) {
      tile.setAttribute('data-level', '2'); // Mark as landed
    }
  });

  // After landing, check and clear full columns and shift left
  clearFullColumns();
  clearFullColumns();
  clearFullColumns();
  clearFullColumns();

  // Spawn a new tetromino
  position = { x: 51, y: 3 }; // Reset position
  spawnTetromino();
};


// Function to rotate the tetromino without shifting up or down
const rotateTetromino = (direction) => {
  // Use the first block as the pivot point
  const pivot = activeTetromino[0];

  // Calculate new positions for the blocks
  const rotatedBlocks = activeTetromino.map(block => {
    const relativeX = block.x - pivot.x;
    const relativeY = block.y - pivot.y;

    // Apply rotation formulas based on direction
    const newX = direction === 'clockwise'
      ? pivot.x - relativeY
      : pivot.x + relativeY;
    const newY = direction === 'clockwise'
      ? pivot.y + relativeX
      : pivot.y - relativeX;

    return { x: newX, y: newY };
  });

  // Find the center of gravity (vertical alignment)
  const originalCenter = Math.floor(
    activeTetromino.reduce((sum, block) => sum + block.y, 0) / activeTetromino.length
  );
  const newCenter = Math.floor(
    rotatedBlocks.reduce((sum, block) => sum + block.y, 0) / rotatedBlocks.length
  );

  // Adjust for vertical alignment
  const centerAdjustment = originalCenter - newCenter;
  const adjustedBlocks = rotatedBlocks.map(block => ({
    x: block.x,
    y: block.y + centerAdjustment,
  }));

  // Check if the adjusted rotation is valid
  const isValidRotation = adjustedBlocks.every(block => {
    const tile = contributionArray[block.y]?.[block.x];
    return tile && (tile.getAttribute('data-level') === '0' || 
      activeTetromino.some(b => b.x === block.x && b.y === block.y));
  });

  if (isValidRotation) {
    // Clear the current tetromino and render the adjusted rotation
    clearTetromino();
    activeTetromino = adjustedBlocks;
    renderTetromino();
  }
};


// Function to move the tetromino up or down
const moveTetrominoVertically = (direction) => {
  const yOffset = direction === 'up' ? -1 : 1;

  // Check if the tetromino can move in the given direction
  const canMoveVertically = activeTetromino.every(block => {
    const nextY = block.y + yOffset;
    const nextTile = contributionArray[nextY]?.[block.x];

    return (
      nextTile &&
      (nextTile.getAttribute('data-level') === '0' || 
       activeTetromino.some(b => b.x === block.x && b.y === nextY)) // Allow movement over itself
    );
  });

  if (canMoveVertically) {
    // Clear the current tetromino position
    clearTetromino();

    // Move the tetromino in the given direction
    activeTetromino = activeTetromino.map(block => ({
      x: block.x,
      y: block.y + yOffset,
    }));

    // Render the tetromino in its new position
    renderTetromino();
  }
};



// Add event listeners for vertical movement keys
document.addEventListener('keydown', (event) => {
  event.preventDefault(); // Removes the default keyboard actions from the page.
  // NOTE: There would be no way to restore default keyboard actions other than refreshing the page
  
  if (gameOver) return;
  
  let input = event.key
  // Convert only letters to lowercase for case-insensitive comparison, Ignores non-letter key actions
  if (input.length === 1 && /[a-zA-Z]/.test(input))
  {
	  input = input.toLowerCase();
  }
  
  switch (input) {
	case 'ArrowUp':
    case 't':
      moveTetrominoVertically('up'); // Move up
      break;
	case 'ArrowDown':
    case 'g':
      moveTetrominoVertically('down'); // Move down
      break;
	case 'ArrowLeft':
    case 'x':
      dropTetrominoLeft(); // Trigger instant left drop
      break;
    case 'f':
      rotateTetromino('counterclockwise'); // Rotate counterclockwise
      break;
    case 'h':
      rotateTetromino('clockwise'); // Rotate clockwise
      break;
  }
});



// Start the game
spawnTetromino();
setInterval(moveTetromino, 150); // Move the tetromino every 500ms

