# React Charts Prototype

Playground to experiment with various chart libaries and assess the extend of customization that can be achive using existing api or extending the libary itself.

# Requirements

- Multiple selection of the lines in the graph.
- Multiple selection responsding to list selection and vica versa.
- Graph are to be pan and zoom capable.
- Selected colors are to be consistent order of selection.
- Unselected lines will be muted and grayed out when note selected.
- Hover over the line will highlight the line and provide tool tips at the nearest data point.
- X-axis are to have major ticks to for year-to-year increments and minor ticks for each of the quarter.
- Y-axis are to scale to base on the visible plot min and max data
- Y-axis are to be represented with line across the chart in and increment values that are whole numbers, no fractions.
- Alternate shading along the x-axis from year to year.
- Legend are visible only when the data line are selected, the color must match corresponding data line.
- Chart will zoom to the corresponding range according to the zoom year range.
- chart will zoom according to the custom entered date range enter by the user limit to only the avialable date.
- Indicate line to be visible to seperate data beyond current date to the right of the line as "Forcast" data.

# To run locally

Recommend installing both Node and Yarn.

```sh
git clone https://github.com/vsumitra/react-charts-prototype

> cd react-charts-prototype
> yarn install
> yarn webpack

On another instance of shell.
```sh
> yarn dev

