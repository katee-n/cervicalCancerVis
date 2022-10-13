import * as d3 from 'd3';

class Circles {
  constructor(_config, _data) {
    this.data = _data;
    // no dispatcher because only slider is interactive

    // config object with defaults
    this.config = {
      parentElement: _config.parentElement || 'body',
      colorScale: _config.colorScale,
      width: _config.width || 700,
      height: _config.height || 400,
      margin: _config.margin || { top: 20, right: 20, bottom: 20, left: 20 },
      tooltipPadding: _config.tooltipPadding || 15,
    };

    this.binsGroup = null;

    // call the init function to create the circles
    this.initVis();
  }

  initVis() {
    const that = this;

    // calculate the inner bounds
    that.boundedWidth =
      that.config.width - that.config.margin.left - that.config.margin.right;
    that.boundedHeight =
      that.config.height - that.config.margin.top - that.config.margin.bottom;

    // initialize the svg
    that.wrapper = d3
      .select(that.config.parentElement)
      .attr('width', that.config.width)
      .attr('height', that.config.height);

    // real drawing area
    that.bounds = that.wrapper
      .append('g')
      .attr(
        'transform',
        `translate(${that.config.margin.left}, ${that.config.margin.top})`
      );

    // group for bins
    that.binsGroup = that.bounds.append('g').attr('class', 'bins');

    // get title for tooltip
    that.tooltipAccessor = function(d) {
      if(d3.group(d, d => d.hinselmann).get("0").length == d.length) return "Did no checkups";
      else return "Did checkups";
    }

  }

  updateVis() {
    const that = this;

    // specify accessor functions
    that.checkupAccessor = (d) =>
      d['hinselmann'] + d['schiller'] + d['citology'] + d['biopsy']; // add together all attributes
    that.yAccessor = (d) => d.length;

    

    // create bins
    that.binGenerator = d3
      .bin()
      .domain(d3.extent(that.data, that.checkupAccessor))
      .value(that.checkupAccessor)
      .thresholds([0, 1]); // divide bins in 0 and bigger than 0 -> no checkups - at least one checkup

    that.bins = that.binGenerator(that.data);

    that.renderVis();
  }

  renderVis() {
    const that = this;

    // for entering and then updating circles   // --> ENTER + UPDATE 
    that.circles = that.binsGroup.selectAll('circle') // select all circles
      .data(that.bins) // bind data to it, also when updated
      .join('circle') // join to first enter and then always update the circles
      .attr('cx', (d, i) => i * 300 + 200)
      .attr('cy', 160)
      .attr('fill', '#7262DC');

    // transition for radius
    that.circles.transition()
      .duration(600)
      .attr('r', d => that.yAccessor(d) * 0.2); // radius changes with data

    // add tooltips
      that.circles.on('mouseover', (e, d) => {
        d3.select('#tooltip')
            .style('opacity', 1)
            .style('left', (e.pageX + that.config.tooltipPadding) + 'px')
            .style('top', (e.pageY + that.config.tooltipPadding) + 'px')
            .html(`
            <div class="tooltip-title">${that.tooltipAccessor(d)}</div>
            <div>${that.yAccessor(d)} people</div>
            `)
      })
      .on('mouseleave', () => {
          d3.select('#tooltip').style('opacity', 0);
      })

  }
}

export default Circles;
