module.exports = function (app) {

	app.get("/realtime", (req, res) => {
		res.render("realtime", {
			config: config,
			version: version,
		});
	});


};