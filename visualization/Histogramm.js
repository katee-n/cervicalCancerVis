import * as d3 from 'd3';

class Histogramm {
    constructor(_config, _data) {
        this.data = _data;
        // no dispatcher because only slider is interactive

        // config object with defaults
        this.config = {
            parentElement: _config.parentElement || 'body',
            width: _config.width || 800,
            height: _config.height || 360,
            margin: _config.margin || { top: 45, right: 15, bottom: 40, left: 40 },
            tooltipPadding: _config.tooltipPadding || 15
        };

        this.barPadding = 1;

        // call the init function to create the histogramm
        this.initVis();
    }

    initVis() {
        const that = this;

        // calculate the inner bounds
        that.boundedWidth = that.config.width - that.config.margin.left - that.config.margin.right;
        that.boundedHeight = that.config.height - that.config.margin.top - that.config.margin.bottom;

        // initialize scales
        that.yScale = d3.scaleLinear()
            .range([that.boundedHeight, 0]);

        that.xScale = d3.scaleLinear()
            .range([0, that.boundedWidth]);

        // initialize the axes
        that.yAxis = d3.axisLeft(that.yScale)
            .ticks(6)
            .tickSize(-that.boundedWidth - 10)
            .tickPadding(10);

        that.xAxis = d3.axisBottom(that.xScale);

        // initialize the svg
        that.wrapper = d3.select(that.config.parentElement)
            .attr('width', that.config.width)
            .attr('height', that.config.height);

        // real drawing area
        that.bounds = that.wrapper.append('g')
            .attr('transform', `translate(${that.config.margin.left}, ${that.config.margin.top})`);

        // add groups for axes
        that.xAxisG = that.bounds.append('g')
            .style('transform', `translateY(${that.boundedHeight}px)`);

        that.yAxisG = that.bounds.append('g');

        // add group for bins
        that.binsGroup = that.bounds.append('g')
            .attr('class', 'bins');

        // add labels
        that.bounds.append('text')
            .attr('class', 'axis-title')
            .attr('x', that.boundedWidth + 10)
            .attr('y', that.boundedHeight + 20)
            .attr('dy', '.71em')
            .attr('text-anchor', 'end')
            .text('Age');

        that.bounds.append('text')
            .attr('class', 'axis-title')
            .attr('x', 0)
            .attr('y', -15)
            .attr('dy', '.71em')
            .text('Amount of People with Cervical Cancer');

        // get title for tooltip
        that.tooltipAccessor = function(d) {
            const grouped = d3.group(d, d => d.age).keys();
            return grouped;
        }
    }

    updateVis() {
        const that = this;

        // specify accessor functions
        that.ageAccessor = (d) => d['age'];
        that.yAccessor = (d) => d.length;

        // set the xScale domain
        that.xScale.domain(d3.extent(that.data, that.ageAccessor));

        // create bins
        that.binGenerator = d3.bin()
            .domain(that.xScale.domain())
            .value(that.ageAccessor)
            .thresholds(100);
  
        that.bins = that.binGenerator(that.data);

        // set the yScale domain
        that.yScale.domain([0, d3.max(that.bins, that.yAccessor)]);

        that.renderVis();

    }

    renderVis() {
        const that = this;
  
        // add the rectangles
        that.barRects = that.binsGroup.selectAll('rect')
            .data(that.bins)
            .join("rect")
            .attr('x', d => (that.xScale(d.x0) + that.barPadding / 2))
            .attr('y', d => that.yScale(that.yAccessor(d)))
            .attr('width', d => d3.max([0, that.xScale(d.x1) - that.xScale(d.x0) - that.barPadding]))
            .attr('height', d => that.boundedHeight - that.yScale(that.yAccessor(d)))
            .attr('fill', '#5466B6');

        // add axes
        that.xAxisG.transition()
            .duration(600)
            .call(that.xAxis);

        that.yAxisG.transition()
            .duration(600)
            .call(that.yAxis);

        // add tooltips
        that.barRects.on('mouseover', (e, d) => {
            d3.select('#tooltip')
                .style('opacity', 1)
                .style('left', (e.pageX + that.config.tooltipPadding + 'px'))
                .style('top', (e.pageY + that.config.tooltipPadding + 'px'))
                .html(`
                    <div class="tooltip-title">Age: ${that.tooltipAccessor(d).next().value}</div>
                    <div>${that.yAccessor(d)} people</div>
                `)
        })

        .on('mouseleave', () => {
            d3.select('#tooltip').style('opacity', 0);
        });

    }

}

export default Histogramm