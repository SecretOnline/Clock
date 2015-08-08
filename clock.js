(function() {
  function initClock() {
    updateClock();
    setTimeout(function() {
      console.log('haha');
      updateClock();
      setInterval(updateClock, 60000);
    }, millisUntilMin());
  }

  function millisUntilMin() {
    var now = new Date(Date.now());
    var nextMin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1);
    return nextMin.getTime() - Date.now();
  }

  function updateClock() {
    var clock = document.querySelector('.clock');
    var now = new Date(Date.now());

    clock.innerHTML = toTimeString(now);
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

  // Colors taken from AOSP clock, used in Android
  var colors = [
    "#212121",
    "#27232e",
    "#2d253a",
    "#332847",
    "#382a53",
    "#3e2c5f",
    "#442e6c",
    "#393a7a",
    "#2e4687",
    "#235395",
    "#185fa2",
    "#0d6baf",
    "#0277bd",
    "#0d6cb1",
    "#1861a6",
    "#23569b",
    "#2d4a8f",
    "#383f84",
    "#433478",
    "#3d3169",
    "#382e5b",
    "#322b4d",
    "#2c273e",
    "#272430"
  ];

  window.addEventListener('DOMContentLoaded', initClock);
})();
