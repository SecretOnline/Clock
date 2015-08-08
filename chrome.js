chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    frame: 'none'
  }, function(newWin) {
    var doc = newWin.contentWindow.document;
    newWin.contentWindow.addEventListener('load', function() {
      var headerUl = doc.querySelector('header ul');

      var closeButton = doc.createElement('button');
      closeButton.type = 'button';
      closeButton.classList.add('close');
      closeButton.innerHTML = '<img src="res/close.svg" alt="Close" />';
      closeButton.addEventListener('click', function() {
        newWin.close();
      });
      var closeLi = doc.createElement('li');
      closeLi.appendChild(closeButton);

      var minButton = doc.createElement('button');
      minButton.type = 'button';
      closeButton.classList.add('minimize');
      minButton.innerHTML = '<img src="res/minimize.svg" alt="Minimize" />';
      minButton.addEventListener('click', function() {
        newWin.minimize();
      });
      var minLi = doc.createElement('li');
      minLi.appendChild(minButton);

      headerUl.appendChild(minLi);
      headerUl.appendChild(closeLi);
    });
  });
});
