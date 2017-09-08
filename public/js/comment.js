var comments = []
var perpage = 10
var page = 1
var pages = 1
$(document).ready(function(){
  
    $.ajax({
        url: '/api/comment',
        data: {
            contentid: $('#content_id').val()
        },
        dataType: 'json',
        success: function (msg) {
            if (msg.code === 0) {
                comments = msg.comments
                renderComments()
            }
        }
    })

    $('.pager').on('click', 'a', function() {
        if ($(this).parent().hasClass('previous')) {
            page--
        } else {
            page++
        }
        renderComments()
    })
  
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
                comments = msg.comments
                $('#message_content').val('')
                renderComments()
            }  
          }
      })
  })

  
})

function renderComments() {
    var len = comments.reverse().length
    $('.message_count').html(len)
    pages = Math.max(Math.ceil(len / perpage), 1)
    var start = Math.max((page - 1) * perpage, 0)
    var end = Math.min(start + perpage, len)
    var $li = $('.pager li')
    $li.eq(1).html(page + ' / ' + pages)

    if (page <= 1) {
        page = 1;
        $li.eq(0).html('<span>没有上一页了</span>')
    } else {
        $li.eq(0).html('<a href="javascript:;">上一页</a>')
    }

    if (page >= pages) {
        page = pages
        $li.eq(2).html('<span>没有下一页了</span>')
    } else {
        $li.eq(2).html('<a href="javascript:;">下一页</a>')
    }
    
    var html = '';
    if (len > 0) {
        for (var i = start; i < end; i++) {
            html += '<div class="message_box"><p class="name clearfix"><span>' 
            + comments[i].username 
            + '</span><span class="pull-right">'
            + formatDate(comments[i].postTime)
            + '</span></p><p>'
            + comments[i].content
            + '</p></div>'
        }
    } else {
        html = '<div class="message_box"><p>还没有留言</p></div>'
    }
    $('#message_list').html(html)
}

function formatDate(d) {
    var date1 = new Date(d)
    return date1.getFullYear() + '年' + (date1.getMonth() + 1) + '月' + date1.getDate() + '日 ' + date1.getHours() + ':' + date1.getMinutes() + ':' + date1.getSeconds()
}