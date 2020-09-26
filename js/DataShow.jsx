const {
    Paper, TableContainer, Table, TableHead, TableRow, TableBody, TableCell, TableSortLabel
} = MaterialUI;

const convertToType = (item) => {
    const trimmed = item.trim();
    const num = parseFloat(trimmed);
    if ('' + num === trimmed) return num;
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) return date;
    return trimmed;
}

const convertToShow = (item) => {
    if (item instanceof Date) {
        if (!item.getUTCHours()) {
            return item.toLocaleDateString();
        } else {
            return item.toLocaleString();
        }
    }
    return item;
}

const sortBy = (rows, column, asc) => {
    if (rows.length && column) {
        console.log('sorting by', column, asc);
        rows = rows.slice();
        rows.sort((a, b) => {
            return a[column] - b[column]
        });
        if (!asc) {
            rows.reverse();
        }
    }
    return rows;
}

const TableShow = ({ parsed }) => {
    const [order, setOrder] = React.useState({ by: null, asc: 'asc' });
    React.useEffect(() => {
        if (parsed && parsed.length && parsed[0].hasOwnProperty('date')) {
            setOrder({ by: 'date', asc: 'desc' });
        }
    }, [parsed])
    const columns = parsed.length ? Object.keys(parsed[0]) : [];
    const rows = sortBy(parsed, order.by, order.asc === 'asc');
    return (
        <Paper >
            <TableContainer style={{ maxHeight: 1000 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            {columns.map((column, i) => (
                                <TableCell
                                    style={{ backgroundColor: 'lightgrey' }}
                                    key={i}
                                >
                                    <TableSortLabel
                                        active={order.by === column}
                                        direction={order.by === column ? order.asc : 'asc'}
                                        onClick={(event) => {
                                            const property = event.target.textContent;
                                            const isAsc = order.by === property && order.asc === 'asc';
                                            setOrder({ by: property, asc: isAsc ? 'desc' : 'asc' })
                                        }}
                                    >
                                        {column}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, ridx) => (
                            <TableRow
                                key={ridx}
                            >
                                {columns.map((column, cidx) => (
                                    <TableCell key={cidx}>
                                        {convertToShow(convertToType(row[column]))}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    )
}

const DataShow = ({ name, showtable = true }) => {
    const [state, setState] = React.useState({ parsed: [], work: true });
    React.useEffect(() => {
        (async () => {
            setState({ parsed: [], work: true });
            console.log(name);
            const data = await (await fetch(`out/csv/${name[0].toLowerCase() + name.substr(1)}.csv`)).text();
            if (data.split('\n',1)[0].trim() === "<!DOCTYPE html>") {
                setState({ parsed: [], work: false });
                return;
            }
            const parsed = d3.csv.parse(data);
            setState({ parsed: parsed, work: false });
        })();
    }, [name])
    return (
        <>
            {!showtable && !state.parsed.length ? null :
                <a href={`?sheet=${name}`} style={{ textDecoration: 'none' }}>
                    <h2 style={{ marginBlockEnd: 0 }}>
                        {name[0].toUpperCase() + name.substr(1)}
                    </h2>
                </a>
            }
            <CircularWorkGif work={state.work} />
            <DataGraph parsed={state.parsed} />
            {!showtable ? null :
                <TableShow parsed={state.parsed} />
            }
        </>
    )
}

const DataShowCharts = ({ names }) => (
    <>
        <DataShow
            key={'patientsPerDate'}
            name={'patientsPerDate'}
            showtable={false}
        />
        <Grid container key={'chartGrid'}>
            {[
                'infectedPerDate',
                'deadPatientsPerDate',
                'recoveredPerDay',
                'testResultsPerDate',
                'doublingRate',
                'calculatedVerified',
                'deadWeekly_computed',
                'deadDelta_computed'
            ].map(name =>
                <Grid item xs={6} key={name}>
                    <DataShow
                        key={name}
                        name={name}
                        showtable={false}
                    />
                </Grid>
            )}
        </Grid>
    </>
)
