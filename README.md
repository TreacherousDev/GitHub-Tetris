# GitHub-Tetris
GitHub Tetris is a Browser Extension that lets you play Tetris on your GitHub Contribution Graph  


## How to Play
Standard Tetris rules apply. The game automatically checks for full columns, clears them, and shifts the remaining blocks to the left. The player can also trigger an instant left drop of the tetromino. A loss is determined when there is no more space to spawn more tetrominoes.  

### Controls: 
Rotate Clockwise: (H)  
Rotate Counterclockwise: (F)  
Move up: (T)  
Move down: (G)  
Instant Drop: (X)    

To start a new game, simply refresh the browser page and rerun the extension.

___
## Building from Source
### For Firefox
1. Clone the repo or download as zip and unpack.
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`
3. Click on `Load Temporary Add-On`
4. Select the `manifest.json` that is included in the downloaded folder
5. Open a GitHub profile tab and activate the extension


### For Chromium
Chrome Web Store demands that I pay them 5$ to publish my add-on. Hell no.  
With that said, here is how to build it yourself:
1. Clone the repo or download as zip and unpack.
2. Open your Chromium web browser and click on `Extensions` tab
3. Enable `Developer Mode`
4. Click on `Load Unpacked`
5. Select the folder `GitHub-Tetris/GitHub-Tetris-Chromium`
6. Open a GitHub profile tab and activate the extension

___
## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
