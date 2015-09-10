(function() {
  /**
   * Perform first-time initialisation of the page
   */
  function initClock() {
    // Set theme and clock information
    changeTheme();
    updateClock();
    updateDate();

    // Add click handlers
    document.querySelector('button.themes').addEventListener('click', showThemesDropdown);
  }

  /**
   * Returns the number of milliseconds until the next minute mark
   */
  function millisUntilMin() {
    var now = new Date();
    var nextMin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1);
    return nextMin.getTime() - Date.now();
  }

  /**
   * Returns the number of milliseconds until the next day
   */
  function millisUntilDay() {
    var now = new Date();
    var nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return nextDay.getTime() - Date.now();
  }

  /**
   * Updates the time displayed
   */
  function updateClock() {
    // Update time
    var clock = document.querySelector('.clock');
    var now = new Date();
    clock.innerHTML = toTimeString(now);

    // Turn on transitions
    var body = document.querySelector('body');
    body.classList.add('transition');

    // Update theme
    // Make sure theme still exists
    try {
      updateTheme();
    } catch (ex) {
      console.warn('Unable to update theme. Was it deleted?');
    }

    // Remove transition class after 10 seconds
    setTimeout(function() {
      body.classList.remove('transition');
    }, 10000);

    // Set clock to update mext minute
    setTimeout(updateClock, millisUntilMin());
  }

  /**
   * Chnges the date displayed
   */
  function updateDate() {
    // Update date text
    var date = document.querySelector('.date');
    var now = new Date();
    date.innerHTML = toDateString(now);

    // Schedule next update
    setTimeout(updateDate, millisUntilDay());
  }

  /**
   * Change styles according to the currently selected theme
   */
  function updateTheme() {
    if (currentTheme) {
      var body = document.querySelector('body');
      var main = document.querySelector('main');
      body.style.backgroundColor = getThemeBackground();
      main.style.color = getThemeText();
    }
  }

  /**
   * Get the background of the theme at the current time
   */
  function getThemeBackground(theme, time) {
    // Set variable defaults
    if (!theme)
      theme = currentTheme;
    if (!time)
      time = Date.now();

    // Get theme object
    var themeObj = themes[theme] || customThemes[theme];

    // Calculate colour
    var now = new Date(time);
    var bgIndex = Math.floor(themeObj.background.length * (((now.getHours() * 60) + now.getMinutes()) / 1440));
    return themeObj.background[bgIndex];
  }

  /**
   * Gets theme's text colour
   */
  function getThemeText(theme) {
    if (!theme)
      theme = currentTheme;

    var themeObj = themes[theme] || customThemes[theme];

    return themeObj.text;
  }

  /**
   * Gets theme's font family
   */
  function getThemeFont(theme) {
    if (!theme)
      theme = currentTheme;

    var themeObj = themes[theme] || customThemes[theme];

    return themeObj.font || '';
  }

  /**
   * Converts Date object to a friendlier time string
   */
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

  /**
   * Converts Date object to frientlier time string
   */
  function toDateString(time) {
    return days[time.getDay()] + ', ' + time.getDate() + ' ' + months[time.getMonth()];
  }

  /**
   * Change the theme to be used
   */
  function changeTheme(themeName) {
    // Force remove transition class
    document.querySelector('body').classList.remove('transition');

    // If theme not set yet, try getting out of storage
    if (!(currentTheme || themeName)) {
      if (chrome.storage) {
        // Get stored data
        chrome.storage.local.get(['theme', 'customThemes'], function(items) {
          // If custom themes are stored, add them
          if (items.customThemes)
            customThemes = items.customThemes;
          // If current theme is stored, set the theme
          if (items.theme)
            changeTheme(items.theme);
          else
            changeTheme('plain');
        });
        return;
      }
    }

    // Set default theme
    if (!(themeName || currentTheme || themes[currentTheme] || customThemes[currentTheme]))
      themeName = 'plain';

    currentTheme = themeName;

    // If storage is available, store current theme
    if (chrome.storage) {
      chrome.storage.local.set({
        'theme': currentTheme
      });
    }

    // Update theme so it is displayed
    updateTheme();
  }

  /**
   * Show a dropdown to change the theme
   */
  function showThemesDropdown() {
    // Hide the dropdown if it exists
    if (hideDropdown())
      return;

    // Create main dropdown container
    var dropdown = document.createElement('div');
    dropdown.classList.add('dropdown');
    dropdown.innerHTML = '<h2>Themes</h2>';
    // Show non-saving warning if chrome.storage isn't available
    if (!chrome.storage)
      dropdown.innerHTML += '<p>Saved setting and themes are available if you use the Chrome App</p><p>Currently the only way to get it is to clone via GitHub, and add it yourself in the Extensions settings page</p>';

    // Add a list for themes
    var themeList = document.createElement('ul');
    dropdown.appendChild(themeList);

    /**
     * Add the specified theme to the list of themes to select from
     */
    function addToDropdownList(key) {
      var theme = themes[key] || customThemes[key];

      // Create item element
      var themeEl = document.createElement('li');
      themeEl.style.backgroundColor = getThemeBackground(key);
      themeEl.style.color = theme.text;
      themeEl.innerHTML = theme.name;
      themeEl.style.fontFamily = getThemeFont(key);

      // Add handler to change theme
      themeEl.addEventListener('click', function() {
        try {
          changeTheme(key);
        } catch (ex) {
          console.warn('Unable to change theme. Was it deleted?');
        }
        hideDropdown();
      });

      return themeEl;
    }

    // Add default themes
    Object.keys(themes).forEach(function(key) {
      themeList.appendChild(addToDropdownList(key));
    });
    // Add custom themes, if they're available
    Object.keys(customThemes).forEach(function(key) {
      var themeEl = addToDropdownList(key);

      // Add delete button for custom themes
      themeEl.innerHTML += '<button class="delete"><img src="res/delete.svg" alt="Remove" /></button>';
      var removeButton = themeEl.querySelector('button');
      // Remove theme if button clicked
      removeButton.addEventListener('click', function() {
        delete customThemes[key];
        if (chrome.storage)
          chrome.storage.local.set({
            'customThemes': customThemes
          });

        // Hide and re-show dropdown to refresh list
        hideDropdown();
        showThemesDropdown();
      });
      themeList.appendChild(themeEl);
    });

    // Add button to create new theme
    var newTheme = document.createElement('li');
    newTheme.innerHTML = 'Create new theme';
    newTheme.addEventListener('click', showNewThemeDropdown);
    themeList.appendChild(newTheme);

    document.querySelector('body').appendChild(dropdown);
  }

  /**
   * Hide the dropdown if it's there
   */
  function hideDropdown() {
    var dropdown = document.querySelector('div.dropdown');
    if (dropdown) {
      dropdown.parentNode.removeChild(dropdown);
      return true;
    }
  }

  /**
   * Show dropdown for the creation of a new theme
   */
  function showNewThemeDropdown() {
    // Hide current dropdown
    hideDropdown();

    // Create dropdown element
    var dropdown = document.createElement('div');
    dropdown.classList.add('dropdown');
    dropdown.innerHTML = '<h2>New Theme</h2>';

    // Add warning for lack of chrome.storage
    if (!chrome.storage)
      dropdown.innerHTML += '<p><strong>Changes made here won\'t be kept if you\'re using a web browser and close it.</strong></p>';

    // Add CSS colour reference link
    dropdown.innerHTML += '<p>Colors must be in a valid CSS format. Some examples can be found on the <a href="https://developer.mozilla.org/en/docs/Web/CSS/color_value#Color_keywords">Mozilla Developer Network</a></p>';
    // Add inputs
    dropdown.innerHTML += '<p>Theme name: <input type="text" class="name"></p><p>Text color: <input type="text" class="color"></p><p>Background color: <input type="text" class="bgcolor"></p>';

    // Add list for options
    var optionList = document.createElement('ul');
    dropdown.appendChild(optionList);

    // Add cancel button
    var cancel = document.createElement('li');
    cancel.innerHTML = 'Cancel';
    cancel.addEventListener('click', hideDropdown);
    optionList.appendChild(cancel);

    // Add button to show JSON input
    var byJSON = document.createElement('li');
    byJSON.innerHTML = 'Advanced Input';
    byJSON.addEventListener('click', showJSONDropdown);
    optionList.appendChild(byJSON);

    // Add button to create theme
    var create = document.createElement('li');
    create.innerHTML = 'Create Theme';
    create.addEventListener('click', function() {
      // Generate randon ID
      var id = Math.floor(Math.random() * 10000);
      // Set theme
      customThemes[id] = {
        name: dropdown.querySelector('.name').value,
        text: dropdown.querySelector('.color').value,
        background: [dropdown.querySelector('.bgcolor').value]
      };
      // Add to storage if available
      if (chrome.storage)
        chrome.storage.local.set({
          'customThemes': customThemes
        });

      // Hide dropdown and change theme
      hideDropdown();
      changeTheme(id);
    });
    optionList.appendChild(create);

    document.querySelector('body').appendChild(dropdown);
  }

  function showJSONDropdown() {
    // Hide current dropdown
    hideDropdown();

    // Create new dropdown container
    var dropdown = document.createElement('div');
    dropdown.classList.add('dropdown');
    dropdown.innerHTML = '<h2>New Theme</h2>';
    // Add warning for no error checking
    dropdown.innerHTML += '<p>Very little error checking happens here.<br>If you use this input, it is assumed you know what you are doing.</p>';

    // Input JSON input
    dropdown.innerHTML += '<p>JSON:</p><p><input type="text" class="json"></p>';

    // Add list for options
    var optionList = document.createElement('ul');
    dropdown.appendChild(optionList);

    // Add cancel button
    var cancel = document.createElement('li');
    cancel.innerHTML = 'Cancel';
    cancel.addEventListener('click', showNewThemeDropdown);
    optionList.appendChild(cancel);

    // Add creation button
    var create = document.createElement('li');
    create.innerHTML = 'Create Theme';
    create.addEventListener('click', function() {
      // Pick random ID
      var id = Math.floor(Math.random() * 10000);
      customThemes[id] = JSON.parse(dropdown.querySelector('.json').value);
      // Store, if storage available
      if (chrome.storage)
        chrome.storage.local.set({
          'customThemes': customThemes
        });

      // Change theme
      hideDropdown();
      changeTheme(id);
    });
    optionList.appendChild(create);

    document.querySelector('body').appendChild(dropdown);
  }

  var currentTheme;
  // Themes!
  var customThemes = {};
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
