(function() {

    initMap();

    var labor_data = null;
    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scaleExtent([1, 10])
        .scale(1)
        .on("zoom", zoom);

    function zoom() {
        d3.select("svg").selectAll("path").attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale +
            ")");
        d3.select("svg").selectAll("image").attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale +
            ")");
    }

    function getLabor() {
        d3.json("/data/labor_force_area_data.json", function (error, data) {
            if (error) return console.error(error);
            labor_data = data
        })
    }

    function initMap() {
        d3.json("/map/taiwan.json", function (error, map) {
            if (error) return console.error(error);
            if (!labor_data) getLabor();

            projection = d3.geo.mercator().center([121, 23, 5]).scale(8000).translate([700, 400]);
            path = d3.geo.path().projection(projection);
            features = topojson.feature(map, map.objects.County_WGS84).features;

            d3.select("#taiwan-map-svg svg")
            .selectAll("path")
            .data(features)
            .enter()
            .append("path").attr({
                d: path,
                fill: "#9EF89E",
                class: "area"
            }).on({
                "click": function (data) {
                    properties = data.properties;

                    var labor_current = labor_data.find(function(element) {
                        return element.country_id == properties.County_ID;
                    });

                    document.getElementById("area_info_title").innerHTML = properties.C_Name;
                    document.getElementById("employed_labor_force").innerHTML = labor_current["就業者_占勞動力之比率_Employed_Proportion_of_employed_persons_to_labor_force"];
                    document.getElementById("unemployment_rate_total").innerHTML = labor_current["失業率_總計_Unemployment_rate_Total"];
                    document.getElementById("unemployment_rate_man").innerHTML = labor_current["失業率_男_Unemployment_rate_Male"];
                    document.getElementById("unemployment_rate_female").innerHTML = labor_current["失業率_女_Unemployment_rate_Female"];
                },
                "mouseover": function (d) {
                    d3.select(this).classed("active", true);
                    var x = d3.mouse(this)[0];
                    var y = d3.mouse(this)[1];

                    $('#mouseInf').css({
                        "top": (y) + "px",
                        "left": (x) + "px"
                    }).show("fast");
                    $('#mouseInf').text(d.properties.C_Name);
                },
                "mouseout": function () {
                    d3.select(this).classed("active", false);
                    $('#mouseInf').hide();
                },
            })
            .call(zoom);

            var dataObject = {
                '臺北市': 99,
                '新北市': 99,
                '桃園市': 99,
                '臺中市': 99,
                '臺南市': 99,
                '高雄市': 99,
            };

            for (item = features.length - 1; item >= 0; item--) {
                var site = features[item].properties.C_Name;
                var parameter = dataObject[site];

                if (typeof parameter == 'undefined') {
                    features[item].properties.parameter = Math.floor((Math.random() * 100) + 1);
                } else {
                    features[item].properties.parameter = parameter;
                }
            }

            var color = d3.scale.linear().domain([1,100]).range(["rgb(255, 191, 0)","rgb(69,173,168)"])

            d3.select("svg")
            .selectAll("path")
            .data(features)
            .attr({
                d: path,
                fill: function (d) {
                    return color(d.properties.parameter);
                },
                class: "area"
            })
        })
    }
}());