# Stores data and dashboard

The Stores section reads the Kaggle `stores.csv` file from this folder. Source: https://www.kaggle.com/datasets/ricgomes/global-fashion-retail-stores-dataset

## Columns used

- `Store ID` — unique store identifier
- `Country` — source country value (the dashboard displays China, Germany and Spain in English)
- `City` and `Store Name` — store labels
- `Number of Employees` — employee count at the store
- `ZIP Code` — postal code
- `Latitude` and `Longitude` — coordinates used by the location scatter plot

## Stores API endpoints

- `GET /api/stores/summary`
- `GET /api/stores/per-country`
- `GET /api/stores/employees-per-country`
- `GET /api/stores/employee-distribution`
- `GET /api/stores/employees-per-store`
- `GET /api/stores/locations`

## Important interpretation notes

- The supplied file contains 35 store records across 7 countries. It has 5 stores in each country. This is why a stores-per-country chart would have equal bars; the dashboard instead uses employee totals to show a meaningful country comparison.
- The supplied employee counts range from 7 to 10 per store. The employee-distribution chart counts how many stores have each team size.
- The location chart is an XY scatter plot using the actual longitude and latitude columns. It is not a geographic basemap.
- Do not change or invent values to make the charts look more varied. The charts are calculated directly from the CSV.
