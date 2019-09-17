!(function($) {
    var clientAPP = null;
    initAPP = function(_client) {
        clientAPP = _client;
        clientAPP.events.on('app.activated', initHandlers);
    };

    initHandlers = function() {
        $("#openGoogleMap").on("click", function() {
            clientAPP.interface.trigger('showModal', { title: 'Distance Matrix Service', template: 'content.html' });
        });

        clientAPP.instance.receive(
            function(event)  {
                var data = event.helper.getData();
                if(data.type === 'note') {
                    var outputDiv = document.getElementById('outputNote');
                    outputDiv.innerHTML = data.note;
                    setToNote(data.note);
                } else {
                    notifyUser("success", data.note);
                }
                
            }
        );
    };

    setToNote = function(noteText) {
        clientAPP.interface.trigger("click", {id: "openNote", text: noteText});
    };

    notifyUser = function(type, message) {
        clientAPP.interface.trigger("showNotify", {
            type: type,
            message: message
        });
    };

    $(document).ready(function() {
        app.initialized().then(
            initAPP
            ,
            function(error) {
                notifyUser("error", "Please contact Groworx. Status: " + error);
            }
        );
    });
})(window.jQuery);
