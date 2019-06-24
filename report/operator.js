$(function() {
  data = [], infoStr = '';
  $.ajax({
    url: 'https://script.google.com/macros/s/AKfycbyi2sn97OkkOFIfVt3BVH3ToEPBFvx4G_dQ_oS_jYxqcZNuB_c/exec',
    type: "GET",
    dataType: 'text',
    cache: false,
    success: function (response) {
      response = response.replace(/\"|￦/g, '');
      data = response.split('\n').map((line) => line.split(','));
      data.pop();
      for(var i in data) {
        if(data[i].length > 13) {
          var str = '';
          for (var j = 9; j < data[i].length - 3; j++) str += data[i][j];
          data[i][9] = str;
        }
        data[i].splice(10, data[i].length - 11);
      }
      $('input').attr('disabled', false);
      $('#status').css('color', '#15be00');
      $('#status').text('Ready.');
      console.log(data);
    }
  });
  $('#name').keyup(function () {
    if($('#name').val()) {
      var str = '';
      $('#list').html('검색 중...');
      for(var i = data.length - 1; i; i--) {
        if(data[i][1] == $('#name').val() && !data[i][10]) {
          str += '<label><input type="radio" name="radioList" value="' + i + '">' +
                  data[i][0].slice(7).replace('.', '월').replace(' 오후', '일 오후').replace(' 오전', '일 오전') + ' ' + data[i][2] + ' ' + data[i][1] + ' 님<br>' +
                  '&nbsp;&nbsp;&nbsp;&nbsp;' + data[i][5] + ' / ' + data[i][6] + ' - ' + data[i][7] + ' 사용</input></label><br><span style="line-height:50%"><br></span>';
        }
      }
      if(!str) $('#list').html('기록이 없습니다.');
      else $('#list').html(str + '<br><div style="margin:0 0 0 30"><input type="button" id="proceed" style="width:70; height=30;" value="선택"></input></div>');
    }
    $('#proceed').click(function() {
      var i = $('input:radio[name=radioList]:checked').val();
      $('#list').css('display', 'none');
      $('#confirm').css('display', 'block');
      $('#infoBox').html(
        data[i][0].slice(7).replace('.', '월').replace(' 오후', '일 오후').replace(' 오전', '일 오전') + ' ' +  data[i][2] + ' ' +
        data[i][1] + ' 님<br>&nbsp;&nbsp;' + data[i][5] + ' / ' + data[i][6] + ' - ' + data[i][7] + ' 사용'
      );
    });
  });
  $('#image').change(function() {
    readURL(this);
  });
  $('#submit').click(function() {

  });
  function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) { $('#preview').attr('src', e.target.result); }
      reader.readAsDataURL(input.files[0]);
    }
  }
});
