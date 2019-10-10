(function() {
  var v_calendar = {},
    daysPerMonth = 42, // 一个月展示的天数
    monthHeight = 276, // 日历中一个月的高度
    firstDayWeekDay, // 本月第一天是星期几
    lastDate, // 本月最后一天是几号
    monthData, // 本月的日期数据
    weeksPerMonth, // 本月包含的周数
    whichLine, // 指定日期在第几行
    firstYearShowed, // 已经展示的最开始的年份
    firstMonthShowed, // 已经展示的最开始的月份
    lastYearShowed, // 已经展示的最后的年份
    lastDateShowd; // 已经展示的最后的月份

  var thisYear, thisMonth, thisDate; // 今年今月今日

  v_calendar.getMonthData = function(year, month) {
    var res = [];
    var today = new Date();
    thisYear = today.getFullYear();
    thisMonth = today.getMonth() + 1;
    thisDate = today.getDate();
    if (typeof year === 'undefined' || typeof month === 'undefined') {
      year = thisYear;
      month = thisMonth;
    }

    var firstDay = new Date(year, month - 1, 1); // 本月第一天
    firstDayWeekDay = firstDay.getDay();
    if (firstDayWeekDay === 0) firstDayWeekDay = 7;

    var lastDay = new Date(year, month, 0); // 本月最后一天
    lastDate = lastDay.getDate();

    weeksPerMonth = Math.ceil((lastDate - (7 - firstDayWeekDay + 1)) / 7) + 1;
    if (year === thisYear && month === thisMonth) {
      whichLine = getLineOfSomeday(thisDate, firstDayWeekDay);
    } else {
      whichLine = 1;
    }

    year = firstDay.getFullYear();
    month = firstDay.getMonth() + 1;

    var i = 0;
    do {
      var _date = new Date(year, month - 1, 1 - (firstDayWeekDay - 1) + i);
      var o = {};
      o.date = _date.getDate()
      if (_date.getMonth() + 1 < month) {
        o.month = -1
      }
      if (_date.getMonth() + 1 == month) {
        o.month = 0
      }
      if (_date.getMonth() + 1 > month) {
        o.month = 1
      }
      res.push(o);
      i++;
    } while (i < daysPerMonth);

    return {
      year: year,
      month: month,
      dates: res
    };
  };

  v_calendar.html = function(year, month) {
    var html = '';

    if (typeof year === 'undefined' || typeof month === 'undefined') {
      var now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1;
    }

    for (var i = -6; i < 5; i++) {
      var iDate = new Date(year, month + i),
          iYear = iDate.getFullYear(),
          iMonth = iDate.getMonth() + 1;

      if (i === -6) {
        firstYearShowed = iYear;
        firstMonthShowed = iMonth;
        console.log('First', firstYearShowed, firstMonthShowed)
      }
      if (i === 4) {
        lastYearShowed = iYear;
        lastDateShowd = iMonth;
        console.log('Last', lastYearShowed, lastDateShowd)
      }

      html += generateOneMonthHtml(iYear, iMonth);
    }
    // html += generateOneMonthHtml(new Date(year, month).getFullYear(), new Date(year, month).getMonth());

    return html;
  };

  v_calendar.render = function(selector, cb) {
    var year, month;
    if (monthData) {
      year = monthData.year;
      month = monthData.month;
    }

    var $wrapper = document.querySelector('.my-calendar-wrapper');

    if (!$wrapper) {
      $wrapper = document.createElement('div');
      $wrapper.className = 'my-calendar-wrapper';
    }
    $wrapper.innerHTML = v_calendar.html(year, month);

    document.querySelector(selector).appendChild($wrapper);

    v_calendar.initScrollTop();
    v_calendar.loadMonthToContainer(10);

    if (cb) cb();
  };

  v_calendar.initScrollTop = function() {
    var thisMonthBox = document.querySelector('.calendar-date-thismonth'),
        dateBox = document.querySelector('.my-calendar-wrapper');

    dateBox.scrollTop = thisMonthBox.offsetTop;
  };

  /**
   * 加载新的月份
   * @param  {[Number]} num 需要添加的月份数量
   */
  v_calendar.loadMonthToContainer = function(num) {
    var dateBox = document.querySelector('.my-calendar-wrapper');
    var enableScroll = true;
    dateBox.addEventListener('scroll', function() {
      if (enableScroll) {
        if (dateBox.scrollTop < monthHeight * 2) {
          enableScroll = false;
          var newH = 0;

          for (var i = 0; i < num; i++) {
            var iDate = new Date(firstYearShowed, firstMonthShowed - 2 - i),
                iYear = iDate.getFullYear(),
                iMonth = iDate.getMonth() + 1;

            console.log('prev', iYear, iMonth)
            dateBox.innerHTML = generateOneMonthHtml(iYear, iMonth) + dateBox.innerHTML;
            newH += monthHeight;
            if (i === num - 1) {
              firstYearShowed = iYear;
              firstMonthShowed = iMonth;
            }
          }

          // console.log('newH',newH)
          dateBox.scrollTop += newH;
          enableScroll = true;
        }

        if (dateBox.scrollTop > dateBox.scrollHeight - dateBox.clientHeight - monthHeight * 2) {
          enableScroll = false;
          for (var i = 0; i < num; i++) {
            var iDate = new Date(lastYearShowed, lastDateShowd + i),
                iYear = iDate.getFullYear(),
                iMonth = iDate.getMonth() + 1;

            console.log('next', iYear, iMonth)
            dateBox.innerHTML += generateOneMonthHtml(iYear, iMonth);
            if (i === num - 1) {
              lastYearShowed = iYear;
              lastDateShowd = iMonth;
            }
          }
          enableScroll = true;
        }
      }
    }, false);
  };

  /**
   * 在日历中添加事件
   * @param {[Array]} eventList
   *   [
   *     {year: 2018, month: 8, list: [{date: 2, type: 0}, {date:8, type: 1}, {date: 13, type: 1}]},
   *     {year: 2018, month: 10, list: [{date: 2, type: 0}, {date:8, type: 1}, {date: 13, type: 1}]}
   *   ]
   */
  v_calendar.addEvents = function(eventList) {
    for (var i = 0; i < eventList.length; i++) {
      var item = eventList[i];
      var selector = '.calendar-date[data-year="' + String(item.year) + '"][data-month="' + String(item.month) + '"]';
      var monthDom = document.querySelector(selector);
      for (var j = 0; j < item.list.length; j++) {
        var subItem = item.list[j];
        var dateDom = monthDom.querySelector('.calendar-date-item[data-date="' + String(subItem.date) + '"]');
        if (Number(subItem.type) === 0) {
          addClass(dateDom, 'calendar-date-item-orange');
        }
        if (Number(subItem.type) === 1) {
          addClass(dateDom, 'calendar-date-item-blue');
        }
      }
    }
  }

  /*生成某个月份的html*/
  function generateOneMonthHtml(year, month) {
    var html = '';

    monthData = v_calendar.getMonthData(year, month);

    if (year === thisYear && month === thisMonth)
      html += '<div class="calendar-date calendar-date-thismonth" data-year="' + year + '" data-month="' + month + '">';
    else
      html += '<div class="calendar-date" data-year="' + year + '" data-month="' + month + '">';

        html += '<div class="calendar-date-title">' +
                  '<span class="title-year">' + year + '年' + month + '月</span>' +
                  '<span class="title-legend title-legend1">' +
                    '<i></i>关注日' +
                  '</span>' +
                  '<span class="title-legend title-legend2">' +
                    '<i></i>重点日' +
                  '</span>' +
                '</div>' +
                '<div class="calendar-date-inner">' + 
                  '<div class="calendar-week">' +
                    '<span>一</span>' +
                    '<span>二</span>' +
                    '<span>三</span>' +
                    '<span>四</span>' +
                    '<span>五</span>' +
                    '<span>六</span>' +
                    '<span>日</span>' +
                  '</div>' +
                  '<div class="calendar-date-container">';
    var i = 0;

    do {
      var oHtml = '';
      if (i === 0)
        oHtml += '<div class="calendar-date-item-box">';
      else
        oHtml += '<div class="calendar-date-item-box">';

      var currentDate = monthData.dates[i].date;
      if (monthData.dates[i].month === -1) {
        oHtml += '<div class="calendar-date-item prev-month">' + currentDate + '</div>';
      }
      if (monthData.dates[i].month === 0) {
        oHtml += '<div class="calendar-date-item current-month" data-date="' + currentDate + '">' + currentDate + '</div>';
      }
      if (monthData.dates[i].month === 1) {
        oHtml += '<div class="calendar-date-item next-month">' + currentDate + '</div>';
      }

      oHtml += '</div>';

      html += oHtml;
      i++;
    } while (i < daysPerMonth);

    html += '</div>' +
          '</div>' +
        '</div>';

    return html;
  }

  function getLineOfSomeday(date, firstDayWeekDay) {
    var firstWeekDays = 7 - firstDayWeekDay + 1, whichLine;

    if (date <= firstWeekDays) whichLine = 1;
    else whichLine = Math.ceil((date - firstWeekDays) / 7) + 1;

    return whichLine;
  }

  window.v_calendar = v_calendar;
})()