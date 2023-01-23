# Variable View Incorporation Brainstorm

## Component Hierarchy

Plans for MVP release of the Variable View
```sh
Search Form
Search Button
    -> Results
        -> Concept Results
            -> Grid
            -> Expanded Layout
        -> Variable Results
            -> Current Layout
                * Histogram
                * Table
            -> ?? Some alternative Layout in the future???
```

```sh
Components
    layout << governs the header & footer


```

Things that could be deleted
- `src/components/modal`

## Expanded Layout

- Now saves the view

The Expanded Layout encompasses:
- the way the Concept cards are displayed

- the way options display with respect to the search bar
    -> Adjacent to the search bar
    -> Below the search bar

Griffin >> just get a functional layout

Ginnie's proposal 1
- the search bar display is dependent on results or not... not the type of results

Results:
- if nothing has been entered, display search bar in center of page
- if results exist, then the search bar is left justified

