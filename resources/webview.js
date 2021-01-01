// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', (e) => {
  e.preventDefault()
});

window.initCrafttorApp = () => {

  const crafttorFrame = document.querySelector('#crafttorFrame');

  function getCookie(cname) {
    const name = cname + "=";
    const ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function checkUserState(nextAction) {
    if (getCookie('user')) {
      crafttorFrame.contentWindow.postMessage({pluginMessage: {type: nextAction, data: getCookie('user')}}, '*');
    } else {
      crafttorFrame.contentWindow.postMessage({pluginMessage: {type: 'noAuth'}}, '*');
    }
  }

  function pasteIllusFile(data) {
    window.postMessage('nativeLog', 'Please wait! We are collecting the data from the Crafttor');
    window.postMessage('pasteIllustration', data.file, data.title, 'paste_' + data.format);
  }

  function externalLinkClickedEvent(url){
    window.postMessage('externalLinkClicked', url);
  }

  window.addEventListener("message", function(event) {
    if (!event.data.pluginMessage) return;
    switch (event.data.pluginMessage.type) {
      case 'file':
        pasteIllusFile(event.data.pluginMessage);
        break;
      case 'logIn':
        setCookie('user', event.data.pluginMessage.data, 365);
        break;
      case 'checkUserState':
        checkUserState(event.data.pluginMessage.nextAction);
        break;
      case 'updateUserData':
        setCookie('user', event.data.pluginMessage.data, 365);
        break;
      case 'logOut':
        setCookie('user', '', 0);
        break;
      case 'externalLinkClickedEvent':
        externalLinkClickedEvent(event.data.pluginMessage.data);
        break;
      default :
        return false;
    }
  });
};
