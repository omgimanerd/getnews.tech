/**
 * @fileoverview Client side JavaScript for rendering site analytics.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

var getTrafficSeries = function(data) {
  var hitsPerDay = {};
  data.map(function(entry) {
    var day = moment(entry.date).startOf('day');
    hitsPerDay[day] = hitsPerDay[day] ? hitsPerDay[day] + 1 : 1;
  });
  var series = [];
  for (var day in hitsPerDay) {
    series.push({ x: new Date(day), y: hitsPerDay[day] });
  }
  return series;
};

$(document).ready(function() {
  $.post('/analytics', function(data) {
    var points = getTrafficSeries(data);
    var scatterChart = new Chartist.Line('.traffic', {
      series: [points]
    }, {
      axisX: {
        type: Chartist.FixedScaleAxis,
        divisor: 5,
        labelInterpolationFnc: function(value) {
          return moment(value).format('MMM D');
        }
      }
    });
  });
});
