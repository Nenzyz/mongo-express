import $ from 'jquery';
import CodeMirror from './codeMirrorLoader';

const doc = CodeMirror.fromTextArea(document.getElementById('document'), {
  mode: {
    name: 'javascript',
    json: true,
  },
  indentUnit: 4,
  lineNumbers: true,
  autoClearEmptyLines: true,
  matchBrackets: true,
  readOnly: ME_SETTINGS.readOnly,
  theme: ME_SETTINGS.codeMirrorEditorTheme,
});

window.onBackClick = function () {
  // "Back" button is clicked

  if (doc.isClean()) {
    history.back();
  } else if ($('#discardChanges').length === 0) {
    $('#pageTitle').parent().append(
      '<div id="discardChanges" class="alert alert-warning"><strong>Document has changed! Are you sure you wish to go back?</strong></div>'
    );
    $('.backButton').text('Back & Discard Changes');
  } else {
    history.back();
  }

  return false;
};

window.onSubmitClick = function () {
  // Save button is clicked
  $('#discardChanges').remove();

  $.ajax({
    type: 'POST',
    url: `${ME_SETTINGS.baseHref}checkValid`,
    data: {
      document: doc.getValue(),
    },
  }).done((data) => {
    if (data === 'Valid') {
      $('#documentInvalidJSON').remove();
      $('#documentEditForm').submit();
    } else if ($('#documentInvalidJSON').length === 0) {
      $('#pageTitle').parent().append('<div id="documentInvalidJSON" class="alert alert-danger"><strong>Invalid JSON</strong></div>');
    }
  });
  return false;
};

window.onJSONClick = function (me) {
  var meNow = me.textContent.trim();
  var JSON_doc = $('#document_json').val();
  var BSON_doc = $('#document_bson').val();
  $('#json_save').prop('disabled', meNow === 'JSON');
  doc.setValue(meNow === 'JSON' ? JSON_doc : BSON_doc);
  me.textContent = (meNow === 'JSON') ? 'BSON' : 'JSON';
  return false;
};

$(document).ready(function () {
  $('.deleteButtonDocument').on('click', function (e) {
    const $form = $(this).closest('form');
    e.stopPropagation();
    e.preventDefault();

    if (ME_SETTINGS.confirmDelete) {
      $('#confirm-document-delete').modal({ backdrop: 'static', keyboard: false }).one('click', '#delete', function () {
        $form.trigger('submit'); // submit the form
      });
    } else {
      $form.trigger('submit');
    }
  });
});
