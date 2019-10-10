(function() {
  var calendar = {},
    firstDayWeekDay,
    lastDate,
    monthData;

  calendar.getMonthData = function(year, month) {
    var res = [];
    if (typeof year === 'undefined' || typeof month === 'undefined') {
      var today = new Date();
      year = today.getFullYear();
      month = today.getMonth() + 1;
    }

    var firstDay = new Date(year, month - 1, 1); // 本月第一天
    firstDayWeekDay = firstDay.getDay(); // 本月第一天是星期几
    if (firstDayWeekDay === 0) firstDayWeekDay = 7;

    var lastDay = new Date(year, month, 0); // 本月最后一天
    lastDate = lastDay.getDate(); // 本月最后一天是几号

    year = firstDay.getFullYear();
    month = firstDay.getMonth() + 1;

    var i = 0;
    do {
      res.push({date: i + 1});
      i++;
    } while (i < lastDate);

    return {
      year: year,
      month: month,
      dates: res
    };
  };

  calendar.html = function(year, month) {
    monthData = calendar.getMonthData(year, month);
    var today = new Date();
    var thisYear = today.getFullYear();
    var thisMonth = today.getMonth() + 1;
    var thisDate = today.getDate();

    var html = '<div class="calendar-header">' +
                  '<span class="calendar-btn calendar-prev-btn"></span>' +
                  '<span class="calendar-btn calendar-next-btn"></span>' +
                  '<span>' + monthData.year + '年' + monthData.month + '月</span>' +
                '</div>' +
                '<div class="calendar-body">' +
                  '<div class="calendar-week">' +
                    '<span>一</span>' +
                    '<span>二</span>' +
                    '<span>三</span>' +
                    '<span>四</span>' +
                    '<span>五</span>' +
                    '<span>六</span>' +
                    '<span>日</span>' +
                  '</div>' +
                  '<div class="calendar-date">';

                  var i = 0;
                  do {
                    var oHtml = '';
                    if (i === 0) oHtml += '<div class="calendar-date-item-box calendar-date-item-box-first">';
                    else oHtml += '<div class="calendar-date-item-box">';
                    if (
                      monthData.year === thisYear &&
                      monthData.month === thisMonth &&
                      i + 1 === thisDate
                    ) {
                      oHtml += '<div class="calendar-date-item calendar-date-item-active">';
                      oHtml += '<span class="calendar-date-single calendar-date-single-today">今天</span>';
                    } else {
                      oHtml += '<div class="calendar-date-item">';
                      oHtml += '<span class="calendar-date-single">' + (i + 1) +'</span>';
                    }
                    oHtml += '</div>' +
                    '</div>';

                    html += oHtml;
                    i++;
                  } while (i < lastDate);

              html += '</div>' +
              '</div>';

    return html;
  };

  calendar.render = function(direction) {
    var year, month;
    if (monthData) {
      year = monthData.year;
      month = monthData.month;
    }

    if (direction === 'prev') month--;
    if (direction === 'next') month++;

    var $wrapper = document.querySelector('.my-calendar-wrapper');

    if (!$wrapper) {
      $wrapper = document.createElement('div');
      $wrapper.className = 'my-calendar-wrapper';
    }
    $wrapper.innerHTML = calendar.html(year, month);

    return $wrapper;
  };

  calendar.addEvents = function(eventsList) {
    /////
    // eventsList = [{num: 3, text: '请假'}]; 3号有一个请假事件
    /////
    var items = document.querySelectorAll('.my-calendar-wrapper .calendar-date-item');

    if (eventsList && eventsList.length > 0) {
      for (var i = 0; i < eventsList.length; i++) {
        var $memo = document.createElement('div');
        $memo.className = 'calendar-date-memo';
        $memo.innerText = eventsList[i].text;
        items[eventsList[i].num - 1].appendChild($memo);
      }
    }
  };

  calendar.init = function(selector, eventsList) {
    document.querySelector(selector).appendChild(calendar.render());
    document.querySelector('.calendar-date-item-box-first').style.marginLeft = 14.2857 * (firstDayWeekDay - 1) + '%';

    calendar.addEvents(eventsList); // 渲染日程

    var wrapper = document.querySelector('.my-calendar-wrapper');
    wrapper.addEventListener('click', function(e) {
      var $target = e.target;

      if (!$target.classList.contains('calendar-btn')) return;
      if ($target.classList.contains('calendar-prev-btn')) {
        document.querySelector(selector).appendChild(calendar.render('prev'));
    document.querySelector('.calendar-date-item-box-first').style.marginLeft = 14.2857 * (firstDayWeekDay - 1) + '%';
      }
      if ($target.classList.contains('calendar-next-btn')) {
        document.querySelector(selector).appendChild(calendar.render('next'));
    document.querySelector('.calendar-date-item-box-first').style.marginLeft = 14.2857 * (firstDayWeekDay - 1) + '%';
      }
    }, false);

    wrapper.addEventListener('click', function(e) {
      var $target = e.target;
      var $parent = $target.parentNode;
      var contain1 = $target.classList.contains('calendar-date-item');
      var contain2 = $parent.classList.contains('calendar-date-item');

      if (contain1 || contain2) {
        var $doms = document.querySelectorAll('.calendar-date-item');
        for (var i = 0; i < $doms.length; i++) {
          $doms[i].classList.remove('calendar-date-item-active');
        }
        if (contain1) $target.classList.add('calendar-date-item-active');
        if (contain2) $parent.classList.add('calendar-date-item-active');
      }
    }, false);
  };

  window.calendar = calendar;
})();