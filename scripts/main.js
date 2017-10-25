/* nodeMCU button script
 * Upon pressing the button, a message is sent to the
 * server indicating that the button has been pressed
 */

 /* We're using jQuery. Wait until document has loaded. */
$(document).ready(function()
{

	/* Our server */
	var url = 'wss://aether-iot.herokuapp.com/';
	/* Create a websocket */
	var ws = new WebSocket(url);
	/* Create an object to store client details */
	var clientConfig =

	{
		messageType     : "config",
		messageContent  :
		{
			device      : "nodeMCU",
			name        : "insta",
			mode        : "send",
			dataType    : "number"
		}
	};

	/* A var to store the user's message */
	var tMessage = "";


	/* When connection is established */
	ws.onopen = function()
	{

		console.log('Connected to ' + url);
		/* Convert client config details to JSON and then
		 * send */
		var clientConfigMsg = JSON.stringify(clientConfig);
		ws.send(clientConfigMsg)

	};

	ws.onmessage = function(data, mask)
	{

		console.log(data);
	};

	$("a").click(function()
	{
		console.log("Sending message");
		tMessage = $("a").val();
		console.log(tMessage);
		ws.send(tMessage);

	});

});
