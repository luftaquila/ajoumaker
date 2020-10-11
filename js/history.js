$(function() {
  let data;
  Swal.fire({
    title: '관리자 인증이 필요합니다.',
    input: 'number',
    inputAttributes: { autocapitalize: 'off' },
    showCancelButton: false,
    confirmButtonText: '인증',
    showLoaderOnConfirm: true,
    preConfirm: (code) => {
      return fetch('https://luftaquila.io/ajoumaker/api/adminVerification', {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code })
      })
      .then(response => {
        if(response.status == 499) throw { name : "codeNotMatchError", message : "code does not match" };
        else if (!response.ok) throw new Error(response.statusText);
        return response.json();
       })
      .catch(error => {
        if(error.name == 'codeNotMatchError')
          Swal.showValidationMessage('인증에 실패하였습니다.');
        else
          Swal.showValidationMessage(`Request failed: ${error}`);
      })
    },
    allowOutsideClick: () => !Swal.isLoading()
  }).then((result) => {
    if (result.isConfirmed) {
      if(result.value.length) {
        $('#history').DataTable({
          pagingType: "numbers",
          pageLength: 100,
          ajax: {
            url: "https://luftaquila.io/ajoumaker/api/requestHistory",
            type: 'POST',
            dataSrc: function(res) {
              data = res;
              return res;
            }
          },
          order: [[ 0, 'desc']],
          columns: [
            { data: "timestamp" },
            { data: "name" },
            { data: "affiliation" },
            { data: "phone" },
            { data: "purpose" },
            { data: "machine" },
            { data: "usage" },
            { data: "identity" },
            { data: "cost" },
            { data: "payment" },
            { data: "responsibility" }
          ],
          columnDefs: [{
            render: function ( data, type, row ) { return new Date(data).format('yyyy-mm-dd HH:MM:ss'); },
            targets: 0
          }]
        });
      }
    }
  });
  $('#export').click(function() {
    if(!data) return;
    function s2ab(s) {
      var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
      var view = new Uint8Array(buf);  //create uint8array as viewer
      for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
      return buf;
    }
    var excelHandler = {
      getExcelFileName : function() { return '장비 사용 기록.xlsx'; },
      getSheetName : function() { return '장비 사용 기록'; },
      getExcelData : function() { return data; },
      getWorksheet : function() { return XLSX.utils.json_to_sheet(this.getExcelData()); }
    }
    var wb = XLSX.utils.book_new();
    var newWorksheet = excelHandler.getWorksheet();
    XLSX.utils.book_append_sheet(wb, newWorksheet, excelHandler.getSheetName());
    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), excelHandler.getExcelFileName());
  });
});

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
