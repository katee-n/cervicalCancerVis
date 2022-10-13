import * as d3 from 'd3';

class Donutchart {
    constructor(_config, _data) {
        this.data = _data;
        // no dispatcher because only slider is interactive

        // config object with defaults
        this.config = {
            parentElement: _config.parentElement || 'body',
            colorScale: _config.colorScale,
            width: _config.width || 900,
            height: _config.height || 500,
            margin: _config.margin || { top: 25, right: 20, bottom: 20, left: 40 },
            tooltipPadding: _config.tooltipPadding || 15
        };

        this.radius = 200;

        // call the init function to create the donutchart
        this.initVis();
    }

    initVis() {
        const that = this;

        // calculate the inner bounds
        that.boundedWidth = that.config.width - that.config.margin.left - that.config.margin.right;
        that.boundedHeight = that.config.height - that.config.margin.top - that.config.margin.bottom;

        // initialize color scale
        that.ordScale = d3.scaleOrdinal()
            .range(['#ea698b','#c05299','#822faf','#571089']);

        // define radius for paths
        that.pathArc = d3.arc()
            .outerRadius(that.radius)
            .innerRadius(120);

        // define radius for labels
        that.labelArc = d3.arc()
            .outerRadius(that.radius)
            .innerRadius(0); 

        // initialize the svg
        that.wrapper = d3.select(that.config.parentElement)
            .attr('width', that.config.width)
            .attr('height', that.config.height);

        // real drawing area
        that.bounds = that.wrapper.append('g')
            .attr('transform', `translate(${that.config.width/2}, ${that.config.height/2})`);
    }

    updateVis() {
        const that = this;

        // define data for pie
        that.pieData = [{name: "Hinselmann", value: parseInt(d3.group(that.data, d => d.hinselmann).get("1").length)}, 
        {name: "Schiller", value: parseInt(d3.group(that.data, d => d.schiller).get("1").length)}, 
        {name: "Citology", value: parseInt(d3.group(that.data, d => d.citology).get("1").length)}, 
        {name: "Biopsy", value: parseInt(d3.group(that.data, d => d.biopsy).get("1").length)}]; 

        that.ordScale
            .domain(that.pieData);
            
        that.pie = d3.pie().value(function(d) { 
            return d.value; 
        });

        that.renderVis();

    }

    renderVis() {
        const that = this;

        // for entering and then updating paths   // --> ENTER + UPDATE 
        that.path = that.bounds.selectAll("path")
            .data(that.pie(that.pieData)) // bind data to paths, also when updated
            .join("path"); // join to first enter and then always update the paths

        // transition for paths
        that.path.transition()
            .duration(600)
            .ease(d3.easeSinIn)
            .attr("d", that.pathArc)
            .attr("fill", d => that.ordScale(d.data.name));

        // for entering and then updating labels   // --> ENTER + UPDATE
        that.label = that.bounds.selectAll("text")
            .data(that.pie(that.pieData))
            .join("text")
            .attr("text-anchor", "middle")
            .text(d => d.data.name)
            .style("font-family", "Poppins")
            .style("font-size", 15);

        // transition for labels
        that.label.transition()
            .duration(600)
            .attr("transform", function (d){
                var c = that.labelArc.centroid(d);
                return "translate(" + c[0]*2.5 +"," + c[1]*2.3 + ")";
            });

        // add tooltips
        that.path.on('mouseover', (e, d) => {
            d3.select('#tooltip')
                .style('opacity', 1)
                .style('left', (e.pageX + that.config.tooltipPadding) + 'px')
                .style('top', (e.pageY + that.config.tooltipPadding) + 'px')
                .html(`
                <div class="tooltip-title">${d.data.name}</div>
                <div>${d.data.value} checkups</div>
                `)
        })
        .on('mouseleave', () => {
            d3.select('#tooltip').style('opacity', 0);
        })

    }

}

export default Donutchart

