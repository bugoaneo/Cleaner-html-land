var file, form_data = new FormData();

var copy = document.querySelector('#copy');
  copy.addEventListener('click', function(event) {
    var copyText = document.querySelector('#hidden_pre');
    copyText.select();

    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      var message = 'Copy was ' + msg;
      successful ? $.jGrowl(message, {theme: 'success',life:2000}) : $.jGrowl(message, {theme: 'error_mes',life:2000});
    } catch(err) {
      $.jGrowl(message, {theme: 'error_mes',life:2000})
    }
  });

var dropZone = $('#dropZone'),
    maxFileSize = 1000000;

if (typeof(window.FileReader) == 'undefined') {
    dropZone.text('Не поддерживается браузером!');
    dropZone.addClass('error');
}

dropZone[0].ondragover = function() {
    dropZone.addClass('hover');
    return false;
};

dropZone[0].ondragleave = function() {
    dropZone.removeClass('hover');
    return false;
};

dropZone[0].ondrop = function(event) {
  event.preventDefault();
  dropZone.removeClass('hover');
  dropZone.addClass('drop');

  file = event.dataTransfer.files[0];

  $('#dropZone span')
    .text(file.name)
    .css('color', '#000');

  form_data.append('file', file);

  if (file.size > maxFileSize) {
      dropZone.text('The file is too large!');
      dropZone.addClass('error');
      return false;
  }
  /*var xhr = new XMLHttpRequest();
  xhr.upload.addEventListener('progress', uploadProgress, false);
  xhr.onreadystatechange = stateChange;
  xhr.open('POST', 'src/handler.php');
  xhr.setRequestHeader('X-FILE-NAME', file.name);
  xhr.send(file);*/
};

// fileElem.onchange = function(e) {
//   console.log(e);
// }

var fileElem = document.querySelector('#fileElem');

fileElem.addEventListener('change', function(e) {

  $('#dropZone span')
    .text(this.files[0].name)
    .css('color', '#000');
  form_data.append('file', this.files[0]);

}, false)

$('#link').on('keypress', function(e) {
  if (e.keyCode == 13) {
    e.preventDefault();
    $('button#send_data').trigger('click');
  }
});
$('button#send_data').on('click',function() {
  if (form_data === undefined) {
    $('#dropZone span').text('Where is your file?');
    return false;
  }
  var link = $('#link').val();
  var backfix = $('#backfix').prop('checked');
  var jquery = $('#jquery').prop('checked');
  var dtime = $('#dtime').prop('checked');

  form_data.append('link', link);
  form_data.append('backfix', +backfix);
  form_data.append('jquery', +jquery);
  form_data.append('dtime', +dtime);

  $.ajax({
      url: 'src/handler.php',
      type: 'post',
      contentType: false, // важно - убираем форматирование данных по умолчанию
      processData: false, // важно - убираем преобразование строк по умолчанию
      data: form_data,
      success: function(php_script_response){
          // $('#pre_html').html(php_script_response);
          // return false;
          var obj = JSON.parse(php_script_response);
          $('#dropZone span').html(obj.info);
          $('#hidden_pre').text(obj.html_data);
          if (obj.html_data !== undefined) {
            $('.box').fadeIn();
            Rainbow.color(obj.html_data, 'html', function(highlighted_code) {
                $("#pre_html").append('<pre class="rainbow">'+highlighted_code+'</pre>');
                //$("#pre_html").slideDown();
            });
          }
      }
  })
})

/*
// Показываем процент загрузки
function uploadProgress(event) {
    var percent = parseInt(event.loaded / event.total * 100);
    dropZone.text('Загрузка: ' + percent + '%');
}

// Пост обрабочик
function stateChange(event) {
    if (event.target.readyState == 4) {
        if (event.target.status == 200) {
            dropZone.text('Загрузка успешно завершена!');
        } else {
            dropZone.text('Произошла ошибка!');
            dropZone.addClass('error');
        }
    }
}
*/
