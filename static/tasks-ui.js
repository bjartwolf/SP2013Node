$(document).ready(function () {
    //$('#createtask-form').hide();
    $('#createNewTask').click(function () {
        $('#taskboard').hide("slide", { direction: "left" }, 1000);
        $('#createtask-form').show();
    });
});