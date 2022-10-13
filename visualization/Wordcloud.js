import * as d3 from 'd3';
import * as cloud from 'd3-cloud';

class Wordcloud {
    constructor(_config, _data) {
        this.data = _data;
        // no dispatcher because only slider is interactive

        // config object with defaults
        this.config = {
            parentElement: _config.parentElement || 'body',
            colorScale: _config.colorScale,
            width: _config.width || 500,
            height: _config.height || 500,
            margin: _config.margin || { top: 35, right: 20, bottom: 0, left: 35 },
            tooltipPadding: _config.tooltipPadding || 15
        };

        // call the init function to create the wordcloud
        this.initVis();
    }

    initVis() {
        const that = this;

        // calculate the inner bounds
        that.boundedWidth = that.config.width - that.config.margin.left - that.config.margin.right;
        that.boundedHeight = that.config.height - that.config.margin.top - that.config.margin.bottom;

        // initialize the svg
        that.wrapper = d3.select(that.config.parentElement)
            .attr('width', that.config.width)
            .attr('height', that.config.height);

        // real drawing area
        that.bounds = that.wrapper.append('g')
            .attr('transform', `translate(${that.config.margin.left}, ${that.config.margin.top})`);

    }

    updateVis() {
        const that = this;

        //build input
        that.myWords = [{word: "IUD", size: d3.group(that.data, d => d.iud).get("1.0").length}, 
               {word: "Smoking", size: d3.group(that.data, d => d.smokes).get("1.0").length}, 
               {word: "STDs", size: d3.group(that.data, d => d.stds).get("1.0").length}, 
               {word: "Pill", size: d3.group(that.data, d => d.hormonalContraceptives).get("1.0").length}, 
               {word: ">5 Sexual Partners", size: d3.group(that.data, d => d.numSexualPartners >= 5).get(true).length}];

        that.renderVis();

    }

    renderVis() {
        const that = this;

        that.layout = cloud()
            .size([that.boundedWidth, that.boundedHeight])
            .words(that.myWords.map(function(d) { return {text: d.word, size:d.size}; }))
            .padding(15)        //space between words
            .rotate(function() { return ~~(Math.random() * 2) * 90; })  //rotation in 90°, 180°, 270°, 0°
            .fontSize(d => d.size/2.7)    // font size of word
            .on("end", draw);
        that.layout.start();

        function draw(words) {
    
            // for entering and then updating the text   // --> ENTER + UPDATE 
            that.wordcloud = that.bounds
                .attr("transform", "translate(" + that.layout.size()[0] / 2 + "," + that.layout.size()[1] / 2 + ")");

            that.wordcloudText = that.wordcloud
                .selectAll("text") // select text from wordcloud
                  .data(words) // bind data to it, also when updated
                .join("text") // join to first enter and then always update the text
                  .style("fill", "#E15A97")
                  .attr("text-anchor", "middle")
                  .style("font-family", "Poppins")
                  .style("font-weight", "bold")
                  .text(d => d.text);
            
            // transition for font-size and rotation
            that.wordcloudText.transition()
                .duration(600)
                .attr("font-size", d => d.size)// font-size changes with data
                .attr("transform", d => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")");
                  
        }

        // add tooltips
        that.bounds.selectAll("text")
            .on('mouseover', (e, d) => {
                d3.select('#tooltip')
                    .style('opacity', 1)
                    .style('left', (e.pageX + that.config.tooltipPadding) + 'px')
                    .style('top', (e.pageY + that.config.tooltipPadding) + 'px')
                    .html(`
                        <div class="tooltip-title">Risk factor: ${d.text}</div>
                        <div>${d.size} people</div>
                    `)
        })
        .on('mouseleave', () => {
            d3.select('#tooltip').style('opacity', 0);
        })

    }
    

}

export default Wordcloud