(function() {
  function initClock() {
    changeTheme();
    updateClock();
    updateDate();
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
    updateTheme();

    setTimeout(updateClock, millisUntilMin());
  }

  function updateDate() {
    var date = document.querySelector('.date');
    var now = new Date();
    date.innerHTML = toDateString(now);

    setTimeout(updateDate, millisUntilDay());
  }

  function updateTheme() {
    var body = document.querySelector('body');
    var main = document.querySelector('main');
    var now = new Date();
    var bgIndex = Math.floor(themes[currentTheme].background.length * (((now.getHours() * 60) + now.getMinutes()) / 1440));
    body.style.backgroundColor = themes[currentTheme].background[bgIndex];
    main.style.color = themes[currentTheme].text;
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
    if (!(themeName || currentTheme || themes[currentTheme]))
      themeName = 'aosp';

    currentTheme = themeName;
    document.cookie = 'theme=' + encodeURIComponent(currentTheme) + ';expires=' + new Date();
  }

  // Default to Android clock (for now)
  var currentTheme;
  // Themes!
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
