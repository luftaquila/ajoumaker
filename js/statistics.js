$(function() {
  $.ajax({
    url: "https://luftaquila.io/ajoumaker/api/requestHistory",
    type: 'POST',
    success: function(res) {
      $('#workingText').text('데이터 계산 중...');
      statistics(res);
    }
  });
});

function statistics(data) {
  let statistics = {
    todayUserCount: 0, // 오늘 사용자 수
    avgUserCount: 0, // 평균 사용자 수
    totalUserCount:0, // 전체 사용자 수
    totalSales: 0, // 전체 매출액
    workingDays: 0, // 전체 영업일 수
  }
  let beforeDate = new Date(data[0].timestamp).format('yyyy-mm-dd');
  let machines = [
    {
      machine: '큐비콘',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }, {
      machine: '신도',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }, {
      machine: 'Onyx',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }, {
      machine: 'Freeform',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }, {
      machine: 'Zortrax',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }, {
      machine: '레이저커터',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }, {
      machine: '플로터',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }, {
      machine: '커팅플로터',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }, {
      machine: 'UV 프린터',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }, {
      machine: 'X7',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }, {
      machine: 'Objet350',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }, {
      machine: 'F370',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }, {
      machine: 'Xfab',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }, {
      machine: '3D 스캐너',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }, {
      machine: '노트북 사용',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }, {
      machine: '강의실 사용',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }
  ];
  let users = [
    {
      identity: '교내구성원',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }, {
      identity: '일반인',
      usageCount: 0,
      usageTime: 0,
      usageCost: 0,
      freeUsageCount: 0
    }
  ]; 
  
  // Looping on whole datasets
  for(let obj of data) {
    // Date Calculations
    let date = new Date(obj.timestamp).format('yyyy-mm-dd');
    if(date == new Date().format('yyyy-mm-dd')) statistics.todayUserCount++;
    if(date != beforeDate) statistics.workingDays++;
    beforeDate = date;
    
    let hrsPattern = /(\d+)시간/;
    let minPattern = /(\d+)분/;
    let hrs = hrsPattern.exec(obj.usage);
    let min = minPattern.exec(obj.usage);
    
    // Machines
    let targetMachine = machines.find(o => o.machine == obj.machine.replace(/ \d번/, ''));
    if(targetMachine) {
      targetMachine.usageCount++;
      if(hrs && min) targetMachine.usageTime += hrs[1] * 60 + Number(min[1]);
      if(obj.cost) targetMachine.usageCost += obj.cost;
      else targetMachine.freeUsageCount++;
    }
    
    // Users
    let targetUser = users.find(o => o.identity == obj.identity);
    if(targetUser) {
      targetUser.usageCount++;
      if(hrs && min) targetUser.usageTime += hrs[1] * 60 + Number(min[1]);
      if(obj.cost) targetUser.usageCost += obj.cost;
      else targetUser.freeUsageCount++;
    }
    
    statistics.totalSales += obj.cost;
    statistics.totalUserCount++;
  }
  
  // data calculations after loop
  statistics.avgUserCount = Math.round(statistics.totalUserCount / statistics.workingDays * 100) / 100;
  setOnPage(statistics, machines, users);
}

function setOnPage(statistics, machine, user) {
  console.log(statistics, machine, user);
  $('#loading').css('display', 'none');
  $('#contents').css('display', 'block');
  $('#todayUserCount').text(statistics.todayUserCount);
  $('#avgUserCount').text(statistics.avgUserCount);
  $('#totalUserCount').text(addComma(statistics.totalUserCount));
  $('#totalSales').text(addComma(statistics.totalSales));
}

function addComma(x) { return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

var dateFormat = function () {
  var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
    timezoneClip = /[^-+\dA-Z]/g,
    pad = function (val, len) {
      val = String(val);
      len = len || 2;
      while (val.length < len) val = "0" + val;
      return val;
    };
  return function (date, mask, utc) {
    var dF = dateFormat;
    if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
      mask = date;
      date = undefined;
    }
    date = date ? new Date(date) : new Date;
    if (isNaN(date)) throw SyntaxError("invalid date");
    mask = String(dF.masks[mask] || mask || dF.masks["default"]);
    if (mask.slice(0, 4) == "UTC:") {
      mask = mask.slice(4);
      utc = true;
    }
    var	_ = utc ? "getUTC" : "get",
      d = date[_ + "Date"](),
      D = date[_ + "Day"](),
      m = date[_ + "Month"](),
      y = date[_ + "FullYear"](),
      H = date[_ + "Hours"](),
      M = date[_ + "Minutes"](),
      s = date[_ + "Seconds"](),
      L = date[_ + "Milliseconds"](),
      o = utc ? 0 : date.getTimezoneOffset(),
      flags = {
        d:    d,
        dd:   pad(d),
        ddd:  dF.i18n.dayNames[D],
        dddd: dF.i18n.dayNames[D + 7],
        m:    m + 1,
        mm:   pad(m + 1),
        mmm:  dF.i18n.monthNames[m],
        mmmm: dF.i18n.monthNames[m + 12],
        yy:   String(y).slice(2),
        yyyy: y,
        h:    H % 12 || 12,
        hh:   pad(H % 12 || 12),
        H:    H,
        HH:   pad(H),
        M:    M,
        MM:   pad(M),
        s:    s,
        ss:   pad(s),
        l:    pad(L, 3),
        L:    pad(L > 99 ? Math.round(L / 10) : L),
        t:    H < 12 ? "a"  : "p",
        tt:   H < 12 ? "am" : "pm",
        T:    H < 12 ? "A"  : "P",
        TT:   H < 12 ? "오전" : "오후",
        Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
        o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
        S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
      };
    return mask.replace(token, function ($0) {
      return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
    });
  };
}();
dateFormat.masks = {"default":"ddd mmm dd yyyy HH:MM:ss"};
dateFormat.i18n = {
  dayNames: [
    "일", "월", "화", "수", "목", "금", "토",
    "일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"
  ],
  monthNames: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ]
};
Date.prototype.format = function (mask, utc) { return dateFormat(this, mask, utc); };

