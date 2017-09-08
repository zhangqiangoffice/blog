var comments;
$(document).ready(function(){
  $('#message_btn').click(function(){
      $.ajax({
          type: 'POST',
          url: '/api/comment/post',
          dataType: 'json',
          data: {
              contentId: $('#content_id').val(),
              content: $('#message_content').val()
          },
          success: function(msg) {
            if (msg.code === 0) {
                comments = msg.comments.reverse()
                $('#message_content').val('')
                renderComments()
            }  
          }
      })
  })
})

function renderComments() {
    var len = comments.length
    $('#message_count').html(len)
    var html = '';
    for (var i = 0; i < len; i++) {
        html += '<div class="message_box"><p class="name clearfix"><span>' 
        + comments[i].username 
        + '</span><span class="pull-right">'
        + comments[i].postTime
        + '</span></p><p>'
        + comments[i].content
        + '</p></div>'
    }
    $('#message_list').html(html)
}