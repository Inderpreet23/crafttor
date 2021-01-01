import BrowserWindow from 'sketch-module-web-view'
import { getWebview } from 'sketch-module-web-view/remote'
import UI from 'sketch/ui'
import sketch from 'sketch'
import sketchDOM from 'sketch/dom'
const webviewIdentifier = 'crafttor.webview'

export default function () {
  const options = {
    identifier: webviewIdentifier,
    width: 400,
    height: 722,
    resizable: false,
    show: false
  };

  const browserWindow = new BrowserWindow(options);

  // only show the window when the page has loaded to avoid a white flash
  browserWindow.once('ready-to-show', () => {
    browserWindow.webContents.executeJavaScript('initCrafttorApp()')
    browserWindow.show()
  });

  const webContents = browserWindow.webContents;

  // print a message when the page loads
  webContents.on('did-finish-load', () => {
    UI.message('Crafttor is ready');
  });

  // add a handler for a call from web content's javascript
  webContents.on('nativeLog', s => {
    UI.message(s);
  });

  webContents.on('externalLinkClicked', url => {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url))
  });

  webContents.on('close', () => {
    browserWindow.close()
  });

  webContents.on('pasteIllustration', (illustration, name, type) => {
    try {
      const document = sketch.fromNative(context.document);
      const page = document.selectedPage;
      const layers = page.selectedLayers;
      let illusNode;

      if (type === 'paste_svg') {
        illusNode = sketchDOM.createLayerFromData(illustration, 'svg');
        illusNode.name = name;
        illusNode.parent = page;
      } else if (type === 'paste_png') {
        illusNode = new sketch.ShapePath({
          name: name,
          frame: new sketch.Rectangle(0,0,1000,1000),
          style: {
            fills: [{
              fill: 'Pattern',
              pattern: {
                patternType: sketch.Style.PatternFillType.Fit,
                image: {
                  base64: illustration
                }
              }
            }]
          },
          parent: page
        });
      }

      UI.message('Your Crafttor illustration is on canvas');
      browserWindow.close()

    } catch (err) {
      UI.message("❌ Error occured: " + err)
    }
  });

  browserWindow.loadURL(require('../resources/webview.html'))
}

// When the plugin is shutdown by Sketch (for example when the user disable the plugin)
// we need to close the webview if it's open
export function onShutdown() {
  const existingWebview = getWebview(webviewIdentifier)
  if (existingWebview) {
    existingWebview.close()
  }
}
