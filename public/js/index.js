$(document).ready(function(){
  $registerBox = $('#registerBox');
  $loginBox = $('#loginBox');
  $userInfo = $('#userInfo');

  $registerBox.find('button').on('click', function(){
    $.ajax({
      type: 'post',
      url: 'api/user/register',
      data: {
        username: $registerBox.find('[name="username"]').val(),
        password: $registerBox.find('[name="password"]').val(),
        repassword: $registerBox.find('[name = "repassword"]').val()
      },
      dataType: 'json',
      success: function(msg) {
        $registerBox.find('.tip').html(msg.message)
        if (!msg.code) {
          setTimeout(() => {
            $loginBox.show()
            $registerBox.hide()
          }, 1000)
        }
      }
    })
  })

  $loginBox.find('button').on('click', function(){
    $.ajax({
      type: 'post',
      url: 'api/user/login',
      data: {
        username: $loginBox.find('[name="username"]').val(),
        password: $loginBox.find('[name="password"]').val(),
      },
      dataType: 'json',
      success: function(msg) {
        $loginBox.find('.tip').html(msg.message)
        if (!msg.code) {
          setTimeout(() => {
            $loginBox.hide()
            $userInfo.show()
          }, 1000)
        }
      }
    })
  })
})