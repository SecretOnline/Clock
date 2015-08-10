(function() {
  function initClock() {
    changeTheme();
    updateClock();
    updateDate();
    document.querySelector('button.themes').addEventListener('click', showThemesDropdown);
  }

  function millisUntilMin() {
    var now = new Date();
    var nextMin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1);
    return nextMin.getTime() - Date.now();
  }

  function millisUntilDay() {
    var now = new Date();
    var nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return nextDay.getTime() - Date.now();
  }

  function updateClock() {
    var clock = document.querySelector('.clock');
    var now = new Date();
    clock.innerHTML = toTimeString(now);

    var body = document.querySelector('body');
    body.classList.add('transition');
    try {
      updateTheme();
    } catch (ex) {
      console.error('error updating theme');
    }
    setTimeout(function() {
      body.classList.remove('transition');
    }, 10000);
    setTimeout(updateClock, millisUntilMin());
  }

  function updateDate() {
    var date = document.querySelector('.date');
    var now = new Date();
    date.innerHTML = toDateString(now);

    setTimeout(updateDate, millisUntilDay());
  }

  function updateTheme() {
    if (currentTheme) {
      var body = document.querySelector('body');
      var main = document.querySelector('main');
      body.style.backgroundColor = getThemeBackground();
      main.style.color = getThemeText();
    }
  }

  function getThemeBackground(theme, time) {
    if (!theme)
      theme = currentTheme;
    if (!time)
      time = Date.now();

    var themeObj = themes[theme] || customThemes[theme];

    var now = new Date(time);
    var bgIndex = Math.floor(themeObj.background.length * (((now.getHours() * 60) + now.getMinutes()) / 1440));
    return themeObj.background[bgIndex];
  }

  function getThemeText(theme) {
    if (!theme)
      theme = currentTheme;

    var themeObj = themes[theme] || customThemes[theme];

    return themeObj.text;
  }

  function toTimeString(time) {
    var hours = time.getHours().toString();
    if (hours > 12)
      hours = hours % 12;
    if (hours < 10)
      hours = '0' + hours;
    var minutes = time.getMinutes().toString();
    if (minutes < 10)
      minutes = '0' + minutes;
    var amPm = time.getHours() % 12 == time.getHours() ? 'am' : 'pm';

    return hours + ':' + minutes + '<sub>' + amPm + '</sub>';
  }

  function toDateString(time) {
    return days[time.getDay()] + ', ' + time.getDate() + ' ' + months[time.getMonth()];
  }

  function changeTheme(themeName) {
    document.querySelector('body').classList.remove('transition');
    // If theme not set yet, try getting out of storage
    if (!(currentTheme || themeName)) {
      if (chrome.storage) {
        chrome.storage.local.get(['theme', 'customThemes'], function(items) {
          if (items.customThemes)
            customThemes = items.customThemes;
          if (items.theme)
            changeTheme(items.theme);
          else
            changeTheme('plain');
        });
        return;
      }
    }

    if (!(themeName || currentTheme || themes[currentTheme] || customThemes[currentTheme]))
      themeName = 'plain';

    currentTheme = themeName;

    if (chrome.storage) {
      chrome.storage.local.set({
        'theme': currentTheme
      });
    }

    updateTheme();
  }

  function showThemesDropdown() {
    if (hideThemesDropdown())
      return;

    var dropdown = document.createElement('div');
    dropdown.classList.add('dropdown');
    dropdown.innerHTML = '<h2>Themes</h2>';
    if (!chrome.storage)
      dropdown.innerHTML += '<p>Custom themes, and saved settings, are available if you use the Chrome App</p>';
    dropdown.innerHTML += '<ul></ul>';
    var themeList = dropdown.querySelector('ul');

    function addToDropdownList(key) {
      var theme = themes[key] || customThemes[key];

      var themeEl = document.createElement('li');
      themeEl.style.backgroundColor = getThemeBackground(key);
      themeEl.style.color = theme.text;
      themeEl.innerHTML = theme.name;

      themeEl.addEventListener('click', function() {
        changeTheme(key);
        hideThemesDropdown();
      });

      return themeEl;
    }

    Object.keys(themes).forEach(function(key) {
      themeList.appendChild(addToDropdownList(key));
    });
    if (chrome.storage) {
      Object.keys(customThemes).forEach(function(key) {
        var themeEl = addToDropdownList(key);
        themeEl.innerHTML += '<button class="delete"><img src="res/delete.svg" alt="Remove" /></button>';
        var removeButton = themeEl.querySelector('button');
        removeButton.addEventListener('click', function() {
          delete customThemes[key];
          if (chrome.storage) {
            chrome.storage.local.set({
              'customThemes': customThemes
            }, function() {
              hideThemesDropdown();
              showThemesDropdown();
            });
          }
        });
        themeList.appendChild(themeEl);
      });

      var newTheme = document.createElement('li');
      newTheme.addEventListener('click', function() {
        //soon
      });
    }

    document.querySelector('body').appendChild(dropdown);
  }

  function hideThemesDropdown() {
    var dropdown = document.querySelector('div.dropdown');
    if (dropdown) {
      dropdown.parentNode.removeChild(dropdown);
      return true;
    }
  }

  // Default to Android clock (for now)
  var currentTheme;
  // Themes!
  var customThemes;
  var themes = {
    aosp: {
      name: 'Android Clock',
      text: '#fff',
      background: [
        '#212121',
        '#27232e',
        '#2d253a',
        '#332847',
        '#382a53',
        '#3e2c5f',
        '#442e6c',
        '#393a7a',
        '#2e4687',
        '#235395',
        '#185fa2',
        '#0d6baf',
        '#0277bd',
        '#0d6cb1',
        '#1861a6',
        '#23569b',
        '#2d4a8f',
        '#383f84',
        '#433478',
        '#3d3169',
        '#382e5b',
        '#322b4d',
        '#2c273e',
        '#272430'
      ]
    },
    plain: {
      name: 'Black on White',
      text: '#000',
      background: [
        '#fff'
      ]
    },
    invert: {
      name: 'White on Dark Grey',
      text: '#fff',
      background: [
        '#222'
      ]
    }
  };
  var days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  var months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  window.addEventListener('DOMContentLoaded', initClock);
})();
