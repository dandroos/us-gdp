//  BAR CHART EXAMPLE USING D3
//  BY DAVID ANDREWS

//  STEP 1 : PULL THROUGH JSON DATA TO POPULATE GRAPH

const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

const req = new XMLHttpRequest();
req.open('GET', url, true);
req.onreadystatechange = ()=>{
    if(req.readyState === 4 && req.status === 200){
        var json = JSON.parse(req.responseText);
        init_bar_chart(json);
    }
}
req.send();

//  STEP 2 : CREATE THE BAR CHART

function init_bar_chart(json){

    const margin = {
        left_and_right: 80,
        top_and_bottom: 20
    }
    const height = 300 + margin.top_and_bottom, width = 600 + margin.left_and_right;

    // TITLE
    d3.select('#chart')
    .append('h1')
    .attr('id', 'title')
    .text('United States GDP');

    var tooltip = 
        d3.select('#chart')
        .append('div')
            .attr('id', 'tooltip')
            .attr('class', 'tooltip')
            .style('opacity', 0);

    var svg =
        d3.select('#chart')
        .append('svg')
        // .attr('height', height)
        // .attr('width', width)
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 ${width} ${height}`);

    var get_date_object = (date_array)=>{
            var temp = date_array.split('-');
            return {
                year: temp[0],
                month: temp[1],
                day: temp[2]
            }
    }
    
    var generate_tooltip_html = (data)=>{
        var temp = get_date_object(data[0]);
        var str = ''
        switch(temp.month){
            case '01':
                str+= `Q1 `;
                break;
            case '04':
                str+= `Q2 `;
                break;
            case '07':
                str+= `Q3 `;
                break;
            case '10':
                str+= `Q4 `;
                break;
            default:
                console.log('error')
        }

        var value_with_thousands_separator = (value)=>{
            return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        }

        str+= `<strong>${temp.year}</strong><br> <strong>$${value_with_thousands_separator(data[1])}</strong> billion`;
        return str;
    }
        
    var arr = json.data.map((i)=>{
       return get_date_object(i[0])
    })

    var x_scale = d3.scaleTime()
    .domain([ 
    new Date(arr[0].year, arr[0].month - 1, arr[0].day),
    new Date(arr[arr.length - 1].year, arr[arr.length - 1].month - 1, arr[arr.length-1].day)
    ])
    .range([0, width - (margin.left_and_right / 2)])

    var y_scale = d3.scaleLinear()
        .domain([0, d3.max(json.data.map((i)=> i[1]))])
        .range([height - margin.top_and_bottom, 30])
    
    var x_axis = d3.axisBottom(x_scale)
        .ticks(5)

        svg.append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(${margin.left_and_right / 2}, ${height - margin.top_and_bottom})`)
        .call(x_axis);

    var y_axis = d3.axisLeft(y_scale)

        svg.append('g')
        .attr('id', 'y-axis')
        .attr('transform', `translate(${margin.left_and_right / 2}, 0)`)
        .call(y_axis);

        svg.append('text')
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left_and_right / 2 + 10)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .attr('id', 'axis-label')
        .style("text-anchor", "middle")
        .text("Gross Domestic Product");   

    // BARS
    svg.selectAll('rect')
    .data(json.data)
    .enter()
    .append('rect')
        .attr('class', 'bar')
        .attr('data-date', (d)=> d[0])
        .attr('data-gdp', (d)=> d[1])
        .attr('height', (d)=> (height - margin.top_and_bottom) - y_scale(d[1]))
        .attr('width', ()=> (width-margin.left_and_right) / json.data.length)
        .attr('x', (d)=> {
            var temp = get_date_object(d[0]);
            return x_scale(new Date(temp.year, temp.month - 1, temp.day))
        })
        .attr('y', (d)=> {
            return y_scale(d[1])
        })
        .attr('transform', `translate(${margin.left_and_right / 2}, 0)`)
        .on('mouseover', (d)=>{
            tooltip.transition()
                .duration(200)
                .style('opacity', 1)
                
                .style('top', `45%`)
                .style('left', `${d3.event.pageX}px`)
                .attr('data-date', ()=> d[0]);

            
            tooltip.html(
                generate_tooltip_html(d)
            )
        })
        .on('mouseout', ()=>{
            tooltip.transition()
            .duration(400)
            .style('opacity', 0);
        });
}