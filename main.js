import * as d3 from 'd3';
import { color } from 'd3';

import './style.css';
import Slider from './visualization/Slider';
import Circles from './visualization/Circles';
import Histogramm from './visualization/Histogramm';
import Wordcloud from './visualization/Wordcloud';
import Donutchart from './visualization/Donutchart';



async function startChart() {                                  
    // global objects
    let data, histogramm, slider, circles, wordcloud, donutchart;

    // initialize dispatcher
    const dispatcher = d3.dispatch('filterDifficulties');

    // load data
    data = await d3.csv('./data/kag_risk_factors_cervical_cancer.csv');

    // create histogramm
    histogramm = new Histogramm({
        parentElement: '#histogramm',
    }, data);

    histogramm.updateVis();

    // create slider
    slider = new Slider({
        parentElement: '#slider-container',
    }, dispatcher, data);

    slider.updateVis();

    // create circles
    circles = new Circles({
        parentElement: '#circles',
    }, data);

    circles.updateVis();

    // create wordcloud
    wordcloud = new Wordcloud({
        parentElement: '#wordcloud',
    }, data);

    wordcloud.updateVis();

    // create donutchart
    donutchart = new Donutchart({
        parentElement: '#donutchart',
    }, data);

    donutchart.updateVis();

    // dispatcher for updating the filter and visualizations
    dispatcher.on('filterDifficulties', ageRange => {
        if(ageRange.length === 0) {
            histogramm.data = data;
            circles.data = data;
            wordcloud.data = data;
            donutchart.data = data;
        } else {
            histogramm.data = data.filter(d => ageRange.includes(d.age));
            circles.data = data.filter(d => ageRange.includes(d.age));
            wordcloud.data = data.filter(d => ageRange.includes(d.age));
            donutchart.data = data.filter(d => ageRange.includes(d.age));
        }

        //update visualizations
        histogramm.updateVis();
        circles.updateVis();
        wordcloud.updateVis();
        donutchart.updateVis();
    });

}

startChart();