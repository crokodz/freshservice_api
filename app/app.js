!(function($) {
    var clientAPP = null,
        successMessage = "All ticket properties have now been updated",
        requiredStatus = "5"; //Close Status Value
    initAPP = function(_client) {
        clientAPP = _client;
        clientAPP.events.on('app.activated', initHandlers);
    };

    closeTicketConfirmation = function() {
        clientAPP.interface.trigger("showConfirm", { title: "Confirm", message: "Are you sure you want to close this ticket?" });
    };

    initHandlers = function() {
        clientAPP.events.on("ticket.propertiesUpdated", function() {
            clientAPP.interface.trigger("showNotify", { type: "success", message: successMessage });//displays the flash notice at the top
        });

        clientAPP.events.on("ticket.closeTicketClick", closeTicketConfirmation);//triggered when the close button is clicked on the top nav bar
        clientAPP.events.on("ticket.statusChanged", function(event) {
            var event_data = event.helper.getData();
            if (event_data.new == requiredStatus){
                closeTicketConfirmation();
            }
        });

        $("#openGoogleMap").on("click", function() {
            clientAPP.interface.trigger('showModal', { title: 'Distance Matrix Service', template: 'content.html' })
                .then(
                    function(data) {
                        console.log("App Loaded");
                    },
                    function(error) {
                        console.log(error);
                    }
                );
        });

        clientAPP.instance.receive(
            function(event)  {
                var data = event.helper.getData();
                var outputDiv = document.getElementById('outputNote');
                outputDiv.innerHTML = data.note;
                setToNote(data.note);
            }
        );
    };

    setToNote = function(noteText) {
        clientAPP.interface.trigger("click", {id: "openNote", text: noteText});
    };

    $(document).ready(function() {
        app.initialized().then(initAPP);
    });
})(window.jQuery);
