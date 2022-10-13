import * as d3 from 'd3';

class Slider {
    constructor(_config, _dispatcher, _data) {
        this.data = _data;
        this.dispatcher = _dispatcher;

        // config object with defaults
        this.config = {
            parentElement: _config.parentElement || 'body',
            width: _config.width || 800,
            height: _config.height || 50,
            margin: _config.margin || { top: 20, right: 20, bottom: 20, left: 20 }
        };

        this.ageRange = [];

        // call the init function to create the slider
        this.initVis();
    }

    // initialize the slider
    initVis() {
        const that = this;

        that.slider = createD3RangeSlider(13, 84, that.config.parentElement);
    }

    // set slider to default range
    updateVis() {
        const that = this;

        that.slider.range(13, 84);

        that.renderVis();
    }

    renderVis() {
        const that = this;

        // when slider gets changed -> change label and push all ages in the range into an array for filtering the other visualizations
        that.slider.onChange(function (newRange) {
            d3.select("#range-label").text(newRange.begin + " - " + newRange.end);
            that.ageRange = [];
            for(let i = newRange.begin; i <= newRange.end; i++) {
                that.ageRange.push((i).toString()); // toString because age in dataSet is a String
            }
            that.dispatcher.call('filterDifficulties', event, that.ageRange)
        });

    }
}

export default Slider;