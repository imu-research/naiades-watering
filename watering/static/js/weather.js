$(function() {

    const renderWeather = function(weatherInfo) {
        const $container = $("#weather-container");

        // collect forecasts
        const forecasts = [];
        for (let idx=0; idx <= 2; idx ++) {
            forecasts.push(weatherInfo[`fcst_day_${idx}`]);
        }

        const current_condition = weatherInfo.current_condition;

        // add component for each forecast
        $.each(forecasts, function(idx, forecast) {
            const $forecast = $('<div />')
                .addClass("forecast")
                .addClass(idx === 0 && "selected")
                .append($("<img />").attr("src", forecast.icon_big))
                .append($("<div />")
                    .addClass("data")
                    .append($("<span />").addClass("date").text(forecast.date.replace(".2021", "")))
                    .append($("<div />")
                        .addClass("temperatures")
                        .append($("<span />").addClass("from")
                            .text(idx === 0 ? `${current_condition.tmp}°C`: `${forecast.tmin}°C`)
                        )
                        .append($("<span />").addClass("separator"))
                        .append($("<span />").addClass("to").text(idx === 0 ? `💧${current_condition.humidity}` :`${forecast.tmax}°C`))
                    )
                );

            // add forecast
            $container.append($forecast);
        });
    };

    // get weather info
    const getWeatherFromContextAPI = function() {
        $.ajax({
            url: "/watering/api/weather/",
            method: "GET",
            success: function(response) {}
        });
    };

    const getWeather = function() {
        $.ajax({
            url: "https://www.prevision-meteo.ch/services/json/carouge",
            method: "GET",
            success: function(response) {
                renderWeather(response);
            }
        });
    };

    // get weather directly from meteo
    getWeather();
});