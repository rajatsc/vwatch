$(document).ready(function(){
    $('#createRoomButton').attr('disabled',true);
    $('#createRoomInput').keyup(function(){
        if($(this).val().length !=0){
            console.log($(this).val().length)
            $('#createRoomButton').attr('disabled', false);
            }            
        else{
            $('#createRoomButton').attr('disabled',true);
        }
    })

    $(".delete_room").on('click', function(event){
        var id = $(this).attr('id');
        console.log(id)
        id = id.substring(0, id.length-7);
        console.log(id);
        $.ajax({
            url: '../rooms/' + id,
            type: 'DELETE',
            success: function(result) {
                if (result.room !== null){
                    console.log("Room Successfully deleted");
                    deleteRoom(result.room);
                    var message = "Room succesfully deleted!"
                    showAlert(message, 'success')
                }
                else{
                    var message = "You are not the admin. Cannot delete room!"
                    showAlert(message, 'danger')
                }
                //$("#alert-top").removeClass(class_var);
            },
            error: function(req, status, err){
                //console.log(req)
                //console.log(status)
                console.log(err)
            }
        });
    });



}) 

function logout(){
	console.log(window.location.href)
	window.location.href="http://127.0.0.1:8080/auth/sign_in"
}

function showAlert(message, type){
    $("#alert-top").html(message) 
    var class_var = "alert-" + type;
    $("#alert-top").addClass(class_var);
    $("#alert-top").show().delay(2000).fadeOut(function(){
        $("#alert-top").removeClass(class_var);
        $("#alert-top").html("")
    });  
}


function deleteRoom(room){
    console.log("Yo I am in delete Room");
    //var video_id = clicked_id.substring( 0, clicked_id.indexOf("-remove"));
    var elementId = room + '-remove';
    var el = document.getElementById(elementId);
    var room = el.parentNode.parentNode
    room.remove()
}

function timedRefresh(timeoutPeriod) {
    setTimeout("location.reload(true);",timeoutPeriod);
}

