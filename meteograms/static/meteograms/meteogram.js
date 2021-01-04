Highcharts.seriesTypes.windbarb.prototype.beaufortFloor = [0, 0.6710820000000001, 3.5791040000000005, 7.605596, 12.303170000000001, 17.89552, 24.158952000000003, 31.093466000000003, 38.475368, 46.528352000000005, 54.80503, 63.752790000000005, 73.14793800000001];


Highcharts.seriesTypes.windbarb.prototype.windArrow = function(point) {
  var knots = point.value * 0.8689762419, //value to convert mph to knots
    level = point.beaufortLevel,
    path,
    barbs,
    u = this.options.vectorLength / 20,
    pos = -10;

  if (point.isNull) {
    return [];
  }

  if (level === 0) {
    return this.chart.renderer.symbols.circle(-10 * u, -10 * u,
      20 * u,
      20 * u
    );
  }

  // The stem and the arrow head
  path = [
    'M', 0, 7 * u, // base of arrow
    'L', -1.5 * u, 7 * u,
    0, 10 * u,
    1.5 * u, 7 * u,
    0, 7 * u,
    0, -10 * u // top
  ];

  // For each full 50 knots, add a pennant
  barbs = (knots - knots % 50) / 50; // pennants
  if (barbs > 0) {
    while (barbs--) {
      path.push(
        pos === -10 ? 'L' : 'M',
        0,
        pos * u,
        'L',
        5 * u,
        pos * u + 2,
        'L',
        0,
        pos * u + 4

      );

      // Substract from the rest and move position for next
      knots -= 50;
      pos += 7;
    }
  }

  // For each full 10 knots, add a full barb
  barbs = (knots - knots % 10) / 10;
  if (barbs > 0) {
    while (barbs--) {
      path.push(
        pos === -10 ? 'L' : 'M',
        0,
        pos * u,
        'L',
        7 * u,
        pos * u
      );
      knots -= 10;
      pos += 3;
    }
  }

  // For each full 5 knots, add a half barb
  barbs = (knots - knots % 5) / 5; // half barbs
  if (barbs > 0) {
    while (barbs--) {
      path.push(
        pos === -10 ? 'L' : 'M',
        0,
        pos * u,
        'L',
        4 * u,
        pos * u
      );
      knots -= 5;
      pos += 3;
    }
  }
  return path;
};

function sortJSON(arr, key, way) {
    return arr.sort(function(a, b) {
        var x = a.fields[key]; var y = b.fields[key];
        if (way === '123') { return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
        if (way === '321') { return ((x > y) ? -1 : ((x < y) ? 1 : 0)); }
    });
}

function Meteogram(json, container) {
    this.precipitations = [];
    this.winds10 = [];
    this.winds11 = [];
    this.temperatures11 = [];
    this.temperatures8 = [];
    this.temperatures10 = [];
    this.snows = [];

    this.from = null;
    this.to = null;

    // Initialize
    this.json = sortJSON(json, 'time', '123');

    console.log(this.json);
    this.container = container;

    // Run
    this.parseMyData();
};

/**
 * Function to smooth the temperature line. The original data provides only whole degrees,
 * which makes the line graph look jagged. So we apply a running mean on it, but preserve
 * the unaltered value in the tooltip.
 */
Meteogram.prototype.smoothLine = function (data) {
    var i = data.length,
        sum,
        value;

    while (i--) {
        data[i].value = value = data[i].y; // preserve value for tooltip

        // Set the smoothed value to the average of the closest points, but don't allow
        // it to differ more than 0.5 degrees from the given value
        sum = (data[i - 1] || data[i]).y + value + (data[i + 1] || data[i]).y;
        data[i].y = Math.max(value - 0.5, Math.min(sum / 3, value + 0.5));
    }
};

/**
 * Draw the weather symbols on top of the temperature series. The symbols are
 * fetched from yr.no's MIT licensed weather symbol collection.
 * https://github.com/YR/weather-symbols
 */
Meteogram.prototype.drawWeatherSymbols = function (chart) {
    var meteogram = this;

    $.each(chart.series[0].data, function (i, point) {
        if (meteogram.resolution > 36e5 || i % 2 === 0) {

            chart.renderer
                .image(
                    'https://cdn.jsdelivr.net/gh/YR/weather-symbols@6.0.2/dist/svg/' +
                        meteogram.symbols[i] + '.svg',
                    point.plotX + chart.plotLeft - 8,
                    point.plotY + chart.plotTop - 30,
                    30,
                    30
                )
                .attr({
                    zIndex: 5
                })
                .add();
        }
    });
};

/**
 * Draw blocks around wind arrows, below the plot area
 */
Meteogram.prototype.drawBlocksForWindArrows = function (chart) {
    var xAxis = chart.xAxis[0],
        x,
        pos,
        max,
        isLong,
        isLast,
        i;

    for (pos = xAxis.min, max = xAxis.max, i = 0; pos <= max + 36e5; pos += 36e5, i += 1) {

        // Get the X position
        isLast = pos === max + 36e5;
        x = Math.round(xAxis.toPixels(pos)) + (isLast ? 0.5 : -0.5);

        // Draw the vertical dividers and ticks
        if (this.resolution > 36e5) {
            isLong = pos % this.resolution === 0;
        } else {
            isLong = true;
        }
        chart.renderer.path(['M', x, chart.plotTop + chart.plotHeight + (isLong ? 0 : 28),
            'L', x, chart.plotTop + chart.plotHeight + 32, 'Z'])
            .attr({
                stroke: chart.options.chart.plotBorderColor,
                'stroke-width': 1
            })
            .add();
    }

    // Center items in block
    chart.get('windbarbs').markerGroup.attr({
        translateX: chart.get('windbarbs').markerGroup.translateX + 2
    });

};

Meteogram.prototype.getTitle = function () {
    return 'Meteogram for ' + "Alta" +
        ', ' + this.json[0].fields.date;
};

/**
 * Build and return the Highcharts options structure
 */
Meteogram.prototype.getChartOptions = function () {
    var meteogram = this;

    return {
        chart: {
            renderTo: this.container,
            marginBottom: 70,
            marginRight: 40,
            marginTop: 50,
            plotBorderWidth: 1,
            height: 310,
            alignTicks: false,
            scrollablePlotArea: {
                minWidth: 720
            }
        },

        title: {
            text: this.getTitle(),
            align: 'left',
            style: {
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
            }
        },

        time: {
            useUTC: false
        },

        credits: {
            text: 'Data from <a href="http://wxstns.net/ALTA.html</a>',
            href: "http://wxstns.net/ALTA.html",
            position: {
                x: -40
            }
        },

        tooltip: {
            shared: true,
            useHTML: true,
            headerFormat:
                '<small>{point.x:%A, %b %e, %H:%M} - {point.point.to:%H:%M}</small><br>' +
                '<b>{point.point.symbolName}</b><br>'

        },

        xAxis: [{ // Bottom X axis
            type: 'datetime',
            tickInterval: 2 * 36e5, // two hours
            minorTickInterval: 36e5, // one hour
            tickLength: 0,
            gridLineWidth: 1,
            gridLineColor: 'rgba(128, 128, 128, 0.1)',
            startOnTick: false,
            endOnTick: false,
            minPadding: 0,
            maxPadding: 0,
            offset: 30,
            showLastLabel: true,
            labels: {
                format: '{value:%H}'
            },
            crosshair: true
        }, { // Top X axis
            linkedTo: 0,
            type: 'datetime',
            tickInterval: 24 * 3600 * 1000,
            labels: {
                format: '{value:<span style="font-size: 12px; font-weight: bold">%a</span> %b %e}',
                align: 'left',
                x: 3,
                y: -5
            },
            opposite: true,
            tickLength: 20,
            gridLineWidth: 1
        }],

        yAxis: [{ // temperature axis
            title: {
                text: null
            },
            labels: {
                format: '{value}°',
                style: {
                    fontSize: '10px'
                },
                x: -3
            },
            plotLines: [{ // zero plane
                value: 0,
                color: '#BBBBBB',
                width: 1,
                zIndex: 2
            }],
            maxPadding: 0.3,
            minRange: 8,
            tickInterval: 1,
            gridLineColor: 'rgba(128, 128, 128, 0.1)'

        }, { // precipitation axis
            title: {
                text: null
            },
            labels: {
                enabled: false
            },
            gridLineWidth: 0,
            tickLength: 0,
            minRange: 10,
            min: 0
         }],

        legend: {
            enabled: false
        },

        plotOptions: {
            series: {
                pointPlacement: 'between'
            }
        },

        series: [{
            name: 'Temperature at 8550 ft',
            data: this.temperatures8,
            type: 'spline',
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: true
                    }
                }
            },
            tooltip: {
                valueSuffix: ' °C'
            },
            zIndex: 1,
            color: '#FF3333',
            negativeColor: '#48AFE8'
        }, {
            name: 'Temperature at 10500 ft',
            data: this.temperatures10,
            type: 'spline',
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: true
                    }
                }
            },
            tooltip: {
                valueSuffix: ' °C'
            },
            zIndex: 1,
            color: '#ffcc00',
            negativeColor: '#48AFE8'
        }, {
            name: 'Temperature at 11068 ft',
            data: this.temperatures11,
            type: 'spline',
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: true
                    }
                }
            },
            tooltip:  {
                valueSuffix: ' °C'
            },
            zIndex: 1,
            color: '#0000ff',
            negativeColor: '#48AFE8'
        }, {
            name: 'Water at 9664 ft',
            data: this.precipitations,
            stack: 'h2o',
            type: 'column',
            color: '#68CFE8',
            yAxis: 1,
            groupPadding: 0,
            pointPadding: 0,
            dataLabels: {
                enabled: !meteogram.hasPrecipitationError,
                formatter: function () {
                    if (this.y > 0) {
                        return this.y;
                    }
                },
                style: {
                    fontSize: '8px',
                    color: 'gray'
                }
            },
            tooltip: {
                valueSuffix: ' in'
            }
        }, {
            name: 'Snow at 9664 ft',
            data: this.snows,
            stack: 'snow',
            type: 'column',
            color: '#ccffff',
            yAxis: 1,
            groupPadding: 0,
            pointPadding: 0,
            
            dataLabels: {
                enabled: !meteogram.hasPrecipitationError,
                formatter: function () {
                    if (this.y > 0) {
                        return this.y;
                    }
                },
                style: {
                    fontSize: '8px',
                    color: 'gray'
                }
            },
            tooltip: {
                valueSuffix: ' in'
            }
        }, {
            name: 'Wind at 10500 ft (avg)',
            type: 'windbarb',
            id: 'windbarbs',
            color: Highcharts.getOptions().colors[1],
            lineWidth: 1.5,
            data: this.winds10,
            vectorLength: 18,
            yOffset: -15,
            tooltip: {
                valueSuffix: ' mph'
            }
        }, {
            name: 'Wind at 11068 ft (avg)',
            type: 'windbarb',
            id: 'windbarbs',
            color: Highcharts.getOptions().colors[5],
            lineWidth: 1.5,
            data: this.winds11,
            vectorLength: 18,
            yOffset: 15,
            tooltip: {
                valueSuffix: ' mph'
            }
        }]
    };
};

/**
 * Post-process the chart from the callback function, the second argument to Highcharts.Chart.
 */
Meteogram.prototype.onChartLoad = function (chart) {

    //this.drawWeatherSymbols(chart);
    this.drawBlocksForWindArrows(chart);

};

/**
 * Create the chart. This function is called async when the data file is loaded and parsed.
 */
Meteogram.prototype.createChart = function () {
    var meteogram = this;
    this.chart = new Highcharts.Chart(this.getChartOptions(), function (chart) {
        meteogram.onChartLoad(chart);
    });
};

Meteogram.prototype.error = function () {
    $('#loading').html('<i class="fa fa-frown-o"></i> Failed loading data, please try again later');
};

Meteogram.prototype.parseMyData = function () {
    var meteogram = this,
        json = meteogram.json;

    json.forEach(
        function (hour, i) {
            hour = hour.fields;
            
            if(meteogram.from == null)
            {
                year = hour.date.split("/")[2]
                month = hour.date.split("/")[0]
                day = hour.date.split("/")[1]
                hours = hour.time.split(":")[0]
                meteogram.from = new Date(year, month, day, hours, 0, 0, 0)
            }
            else
            {
                meteogram.from = meteogram.to;
            }

            if(json.length > i+1)
            {
                year = json[i+1].fields.date.split("/")[2]
                month = json[i+1].fields.date.split("/")[0]
                day = json[i+1].fields.date.split("/")[1]
                hours = json[i+1].fields.time.split(":")[0]
                meteogram.to = new Date(year, month, day, hours, 0, 0, 0)
            }

            meteogram.temperatures11.push({
                x: meteogram.from,
                y: hour.temp_f_11068_avg,
                to: meteogram.to
            });

            meteogram.temperatures8.push({
                x: meteogram.from,
                y: hour.temp_f_8550_avg,
                to: meteogram.to
            });

            meteogram.temperatures10.push({
                x: meteogram.from,
                y: hour.temp_f_10500_avg,
                to: meteogram.to
            });

            meteogram.precipitations.push({
                x: meteogram.from,
                y: hour.h2o_9664_1hr
            });

            meteogram.snows.push({
                x: meteogram.from,
                y: hour.snow_9664_12hr
            });

            meteogram.winds10.push({
                x: meteogram.from,
                value: hour.w_spd_10500_avg,
                direction: hour.w_dir_11068_avg
            });

            meteogram.winds11.push({
                x: meteogram.from,
                value: hour.w_spd_11068_avg,
                direction: hour.w_dir_11068_avg
            });
        }
    );

    // Create the chart when the data is loaded
    console.log(meteogram)
    meteogram.createChart();
};
