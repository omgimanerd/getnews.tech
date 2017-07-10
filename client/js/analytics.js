/**
 * @fileoverview Client side JavaScript for rendering site analytics.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

require('c3/c3.min.css');
require('nouislider/distribute/nouislider.min.css');
require('ubuntu-fontface/_ubuntu-mono.scss')

require('../scss/analytics.scss');

const $ = require('jquery');
const c3 = require('c3');
const d3 = require('d3');
const moment = require('moment');
const noUiSlider = require('nouislider');

const iterByDay = (min, max, callback) => {
  var tmp = moment(min);
  for (const day = tmp; day.isBefore(max); day.add(1, 'day')) {
    callback(day);
  }
};

const getDateRange = data => {
  return data.length < 2 ? null : {
    min: moment(data[0].date).startOf('day'),
    max: moment(data[data.length - 1].date).endOf('day')
  };
};

const min = l => {
  return !l ? 0 : Math.round(Math.min(...l));
};

const avg = l => {
  return !l ? 0 : Math.round(l.reduce((a, b) => a + b) / l.length);
};

const max = l => {
  return !l ? 0: Math.round(Math.max(...l));
};

const getTrafficData = data => {
  const hitsPerDay = new Map();
  const curlPerDay = new Map();
  for (const entry of data) {
    const day = moment(entry.date).startOf('day').toString();
    hitsPerDay.set(day, (hitsPerDay.get(day) || 0) + 1);
    if ((entry.userAgent || '').includes('curl')) {
      curlPerDay.set(day, (curlPerDay.get(day) || 0) + 1);
    }
  }
  const dateColumn = ['date'];
  const hitsPerDayColumn = ['total requests'];
  const curlPerDayColumn = ['curl requests'];
  const range = getDateRange(data);
  iterByDay(range.min, range.max, day => {
    dateColumn.push(day.format('YYYY-MM-DD'));
    day = day.toString();
    hitsPerDayColumn.push(hitsPerDay.get(day) || 0);
    curlPerDayColumn.push(curlPerDay.get(day) || 0);
  });
  return [dateColumn, hitsPerDayColumn, curlPerDayColumn];
};

const getResponseTimeData = data => {
  const timesByDay = [];
  for (var entry of data) {
    const day = moment(entry.date).startOf('day');
    if (timesByDay[day]) {
      timesByDay[day].push(entry.responseTime || 0);
    } else {
      timesByDay[day] = [entry.responseTime || 0];
    }
  };
  const dateColumn = ['date'];
  const minColumn = ['min'];
  const avgColumn = ['avg'];
  const maxColumn = ['max'];
  const range = getDateRange(data);
  iterByDay(range.min, range.max, day => {
    dateColumn.push(day.format('YYYY-MM-DD'));
    minColumn.push(min(timesByDay[day]));
    avgColumn.push(avg(timesByDay[day]));
    maxColumn.push(max(timesByDay[day]));
  });
  return [dateColumn, maxColumn, avgColumn, minColumn];
};

const getSectionFrequencyData = data => {
  const frequencies = new Map();
  for (const entry of data) {
    const url = /\/([a-z]+)|$/g.exec(entry.url || '')[1] || 'home';
    frequencies.set(url, (frequencies.get(url) || 0) + 1);
  }
  const sorted10 = new Map(
    [...frequencies.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
  );
  return [
    ['sections', ...sorted10.keys()],
    ['frequency', ...sorted10.values()],
  ];
};

const getCountryFrequencyData = data => {
  const frequencies = new Map();
  for (const entry of data) {
    const country = entry.country || 'unknown';
    frequencies.set(country, (frequencies.get(country) || 0) + 1);
  }
  const sorted10 = new Map(
    [...frequencies.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
  );
  return [
    ['countries', ...sorted10.keys()],
    ['frequency', ...sorted10.values()]
  ];
};

/**
 * Main jQuery script to initialize the page elements.
 */
$(document).ready(() => {
  const dateSlider = document.getElementById('date-slider');
  $.post('/analytics', data => {
    if (data.length == 0) {
      window.alert('No data!');
    }
    /**
     * Initialize the c3 charts on the page with the analytics data.
     */
    const trafficChart = c3.generate({
      bindto: '#traffic',
      axis: {
        x: { padding: 0, type: 'timeseries' },
        y: { label: 'Requests', min: 0, padding: 0 }
      },
      data: {
        x: 'date',
        columns: getTrafficData(data)
      },
      point: { show: false },
      padding: {
        right: 25
      }
    });
    const responseTimeChart = c3.generate({
      bindto: '#response-time',
      axis: {
        x: { padding: 0, type: 'timeseries' },
        y: { label: 'Milliseconds', min: 0, padding: 0 }
      },
      data: {
        x: 'date',
        columns: getResponseTimeData(data),
        type: 'area'
      },
      point: { show: false }
    });
    const sectionFrequencyChart = c3.generate({
      bindto: '#section-frequency',
      axis: {
        x: { type: 'category', tick: { multiline: true } }
      },
      data: {
        x: 'sections',
        columns: getSectionFrequencyData(data),
        type: 'bar'
      },
      padding: { bottom: 15 }
    });
    const countryFrequencyChart = c3.generate({
      bindto: '#country-frequency',
      axis: { x: { type: 'category', tick: { multiline: true } } },
      data: {
        x: 'countries',
        columns: getCountryFrequencyData(data),
        type: 'bar'
      },
      padding: { bottom: 15 }
    });

    /**
     * Initialize the slider with the proper parameters.
     */
    const range = getDateRange(data);
    const dateFormatter = {
      to: value => {
        return moment.unix(value).format("M/D/YYYY");
      }
    };
    noUiSlider.create(dateSlider, {
      start: [range.min.unix(), range.max.unix()],
      tooltips: [dateFormatter, dateFormatter],
      connect: true,
      margin: moment.duration(10, 'days').asSeconds(),
      range: { min: range.min.unix(), max: range.max.unix() },
      step: moment.duration(1, 'day').asSeconds()
    });

    /**
     * Event handler for our slider so that the c3 charts are updated.
     */
    dateSlider.noUiSlider.on('set', () => {
      const sliderRange = dateSlider.noUiSlider.get().map(d => moment.unix(d));
      const filteredData = data.filter(entry => {
        return moment(entry.date).isBetween(sliderRange[0], sliderRange[1]);
      });
      if (filteredData.length == 0) {
        window.alert('This time segment has no data!');
        return;
      }
      trafficChart.load({
        columns: getTrafficData(filteredData),
        unload: true
      });
      responseTimeChart.load({
        columns: getResponseTimeData(filteredData),
        unload: true
      });
      sectionFrequencyChart.load({
        columns: getSectionFrequencyData(filteredData),
        unload: true
      });
      countryFrequencyChart.load({
        columns: getCountryFrequencyData(filteredData),
        unload: true
      });
    });
  });
});
